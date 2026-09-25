/**
 * Custom-product ETL: MySQL `coustomeproducts` -> Payload `products` (kind='custom').
 *  - drops junk (test/copy/delete/gibberish) like the catalogue exports
 *  - merges buy/rent (protype 1/2) pairs into one doc (key: name|productId)
 *  - resolves category via productId -> categories -> Payload legacyId map
 *  - created as DRAFT; run apply-keep afterwards to publish the "Yes" ones
 *  - legacySourceIds = the coustomeproducts ids (so the sheet's custom DB IDs match)
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-custom-products.mts
 */
import { boot, upsertByLegacyId } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'

function isJunk(name: string) {
  const n = (name || '').trim()
  if (n === '') return true
  if (/copy|delete/i.test(n)) return true
  if (/\btest\b/i.test(n) || n.toLowerCase() === 'test') return true
  if (n.includes(',') && !n.includes(' ')) return true
  if (/^[a-z]{2,8}$/.test(n)) return true
  if (/^[a-z0-9]{1,6}$/i.test(n) && !/[aeiou]/i.test(n)) return true
  return false
}
const plain = (html?: string) =>
  html ? html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : undefined
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

async function main() {
  const payload = await boot()
  const db = await mysqlConn()

  // collision guard: custom ids must not clash with migrated standard products' source ids
  const [[{ minId }]] = (await db.query('SELECT MIN(id) minId FROM products')) as any
  console.log(`standard products.id starts at ${minId}; custom ids are 1..~43 -> ${minId > 43 ? 'NO collision' : 'WARNING: possible collision'}`)

  // category legacyId -> Payload id
  const catMap = new Map<number, string>()
  const cats = await payload.find({ collection: 'categories', limit: 1000, depth: 0 })
  for (const c of cats.docs) if (c.legacyId != null) catMap.set(Number(c.legacyId), c.id)

  const [rows] = (await db.query('SELECT id, productId, protype, name, discription, specificationkey, specificationvalue FROM coustomeproducts')) as any

  // merge buy/rent by name+productId
  const groups = new Map<string, any[]>()
  for (const r of rows) {
    if (isJunk(r.name)) continue
    const key = `${String(r.name).toLowerCase().trim()}|${r.productId}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  const usedSlugs = new Set<string>()
  let done = 0
  for (const g of groups.values()) {
    const canonical = g[0]
    const protypes = new Set(g.map((r) => Number(r.protype)))
    const availability = [protypes.has(1) ? 'buy' : null, protypes.has(2) ? 'rent' : null].filter(Boolean)

    let slug = slugify(clean(canonical.name) ?? String(canonical.id))
    if (usedSlugs.has(slug)) slug = `${slug}-${canonical.id}`
    usedSlugs.add(slug)

    // specs: specificationkey / specificationvalue are parallel newline/comma lists
    const keys = String(canonical.specificationkey ?? '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
    const vals = String(canonical.specificationvalue ?? '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
    const specifications = keys.map((k, i) => ({ section: 'General', label: k, value: vals[i] ?? '' })).filter((s) => s.value)

    await upsertByLegacyId(payload, 'products', canonical.id, {
      kind: 'custom',
      name: clean(canonical.name),
      slug,
      availability: availability.length ? availability : ['buy'],
      category: catMap.get(Number(canonical.productId)),
      shortDescription: plain(clean(canonical.discription))?.slice(0, 900),
      specifications,
      legacySourceIds: g.map((r) => r.id),
      _status: 'draft',
    })
    done++
  }

  await db.end()
  const total = (await payload.count({ collection: 'products' })).totalDocs
  const custom = (await payload.count({ collection: 'products', where: { kind: { equals: 'custom' } } })).totalDocs
  console.log(`\nDONE: ${done} custom products imported (draft). products total now ${total}, of which custom=${custom}.`)
  console.log('Next: re-run apply-keep to publish the custom products marked Yes in the sheet.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
