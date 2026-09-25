/**
 * Product ETL: MySQL `products` (328 rows) -> Payload `products`.
 *  - merges buy/rent (catType 1/2) pairs into one doc (key: name|categoryId|subcategoryId)
 *  - availability from the catTypes present; status=1 anywhere -> published, else draft
 *  - resolves category / applications / industries relations via legacyId maps
 *  - maps the populated spec columns into the flexible `specifications` array
 *  - images deferred to the media backfill (legacySourceIds preserves the join)
 *
 * Run (sample):  LIMIT=10 node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-products.mts
 * Run (full):    node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-products.mts
 */
import { boot, upsertByLegacyId } from './lib/payload.mjs'
import { mysqlConn, parseIdArray, clean } from './lib/mysql.mjs'

// Curated spec columns (only those with real data), grouped by section.
const SPEC_COLS: { col: string; label: string; section: string }[] = [
  ...[
    ['model_no', 'Model No'], ['working_height', 'Working Height'], ['platform_height', 'Platform Height'],
    ['platform_capacity', 'Platform Capacity'], ['platform_size', 'Platform Size'], ['platform_extension', 'Platform Extension'],
    ['machine_weight', 'Machine Weight'], ['swl', 'SWL'], ['ground_clearance', 'Ground Clearance'],
    ['gradeability', 'Gradeability'], ['wheel_type', 'Wheel Type'], ['wheelbase', 'Wheelbase'],
    ['overall_height_up', 'Overall Height (Up)'], ['overall_height_down', 'Overall Height (Down)'],
    ['max_no_of_person', 'Max Persons'], ['power_source', 'Power Source'], ['lift_lower_time', 'Lift/Lower Time'],
    ['max_horizontal_outreach', 'Max Horizontal Outreach'], ['serial_no', 'Serial No'], ['tire_size', 'Tire Size'],
    ['lifting_motor', 'Lifting Motor'], ['charger', 'Charger'], ['location', 'Location'],
  ].map(([col, label]) => ({ col, label, section: 'General' })),
  ...[
    ['mhe_maxliftingheight', 'Max Lifting Height'], ['mhe_maxliftingcapacity', 'Max Lifting Capacity'],
    ['mhe_maxworkingheight', 'Max Working Height'], ['mhe_maxOccupants', 'Max Occupants'],
    ['mhe_groundClearance', 'Ground Clearance'], ['mhe_maxplatformheight', 'Max Platform Height'],
  ].map(([col, label]) => ({ col, label, section: 'Material Handling' })),
  ...[
    ['as_wheels', 'Wheels'], ['as_loadcapacityinkg', 'Load Capacity (kg)'], ['as_rungspacinginmm', 'Rung Spacing (mm)'],
    ['as_rungs', 'Rungs'], ['as_heightoftowerinm', 'Tower Height (m)'],
  ].map(([col, label]) => ({ col, label, section: 'Scaffolding' })),
  ...[
    ['ip_rating', 'IP Rating'], ['lumen_in_ac_mode', 'Lumen (AC)'], ['max_lumen_in_battery_mode', 'Max Lumen (Battery)'],
    ['lighting_area', 'Lighting Area'], ['battery_range', 'Battery Range'],
  ].map(([col, label]) => ({ col, label, section: 'Lighting' })),
]

const stripSlug = (s: string) => s.replace(/^(buy-|rental-)/, '')
const plain = (html?: string) =>
  html ? html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : undefined

async function main() {
  const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0
  const payload = await boot()
  const db = await mysqlConn()

  // legacyId -> new payload id maps for relations
  const mapOf = async (collection: string) => {
    const m = new Map<number, string>()
    const res = await payload.find({ collection, limit: 5000, depth: 0 })
    for (const d of res.docs) if (d.legacyId != null) m.set(Number(d.legacyId), d.id)
    return m
  }
  const [catMap, appMap, indMap] = await Promise.all([mapOf('categories'), mapOf('applications'), mapOf('industries')])

  const [rows] = (await db.query('SELECT * FROM products')) as any

  // group buy/rent (+ dup) rows by identity
  const groups = new Map<string, any[]>()
  for (const r of rows) {
    const key = `${String(r.name).toLowerCase().trim()}|${r.categoryId}|${r.subcategoryId}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  const usedSlugs = new Set<string>()
  let done = 0, published = 0, drafts = 0
  const groupList = [...groups.values()]
  for (const g of groupList) {
    if (LIMIT && done >= LIMIT) break
    const canonical = g.find((r) => r.catType === 1) ?? g[0]
    const catTypes = new Set(g.map((r) => r.catType))
    const availability = [catTypes.has(1) ? 'buy' : null, catTypes.has(2) ? 'rent' : null].filter(Boolean)
    const isPublished = g.some((r) => Number(r.status) === 1)

    // unique slug
    let slug = stripSlug(clean(canonical.slug) ?? String(canonical.id))
    if (usedSlugs.has(slug)) slug = `${slug}-${canonical.id}`
    usedSlugs.add(slug)

    // specs
    const specifications = SPEC_COLS.flatMap(({ col, label, section }) => {
      const v = clean(canonical[col])
      return v ? [{ section, label, value: v }] : []
    })

    const data: Record<string, unknown> = {
      name: clean(canonical.name) ?? `Product ${canonical.id}`,
      slug,
      availability,
      category: catMap.get(Number(canonical.subcategoryId)) ?? catMap.get(Number(canonical.categoryId)),
      applications: parseIdArray(canonical.applications).map((id) => appMap.get(id)).filter(Boolean),
      industries: parseIdArray(canonical.industries).map((id) => indMap.get(id)).filter(Boolean),
      shortDescription: plain(clean(canonical.description))?.slice(0, 900),
      modelNo: clean(canonical.model_no),
      condition: Number(canonical.new) === 1 ? 'new' : Number(canonical.used) === 1 ? 'used' : undefined,
      specifications,
      legacySourceIds: g.map((r) => r.id),
      _status: isPublished ? 'published' : 'draft',
    }
    await upsertByLegacyId(payload, 'products', canonical.id, data)
    isPublished ? published++ : drafts++
    done++
    if (done % 25 === 0) console.log(`  ...${done}/${groupList.length}`)
  }

  await db.end()
  const total = (await payload.count({ collection: 'products' })).totalDocs
  console.log(`\nDONE: ${done} groups imported (${published} published, ${drafts} draft). products in Payload: ${total}`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
