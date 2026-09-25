/**
 * Imports the taxonomy collections from MySQL into Payload:
 *   applications  <- applicationtypes
 *   industries    <- industries (content table)
 *   brands        <- tempbrands (canonical brand names)
 *   categories    <- categories (self-referential; parent linked in 2nd pass)
 * Idempotent (upsert by legacyId). Images are deferred until media ingest.
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-taxonomy.mts
 */
import { boot, upsertByLegacyId } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'

async function main() {
  const payload = await boot()
  const db = await mysqlConn()
  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  // --- Applications (applicationtypes) ---
  const [apps] = (await db.query('SELECT id, name FROM applicationtypes')) as any
  for (const a of apps) {
    if (!clean(a.name)) continue
    await upsertByLegacyId(payload, 'applications', a.id, { name: clean(a.name) })
  }
  console.log(`applications: ${apps.length} processed`)

  // --- Industries (content table) ---
  const [inds] = (await db.query('SELECT * FROM industries')) as any
  for (const i of inds) {
    await upsertByLegacyId(payload, 'industries', i.id, {
      title: clean(i.title) ?? `Industry ${i.id}`,
      slug: clean(i.slug) ?? slugify(clean(i.title) ?? `industry-${i.id}`),
      icon: clean(i.icon),
      shortDescription: clean(i.discription),
      meta: { title: clean(i.meta_title), description: clean(i.meta_discription), keywords: clean(i.meta_keyword) },
    })
  }
  console.log(`industries: ${inds.length} processed`)

  // --- Brands (tempbrands = canonical names) ---
  const [brands] = (await db.query('SELECT id, name FROM tempbrands')) as any
  for (const b of brands) {
    if (!clean(b.name)) continue
    await upsertByLegacyId(payload, 'brands', b.id, { name: clean(b.name), slug: slugify(b.name) })
  }
  console.log(`brands: ${brands.length} processed`)

  // --- Categories (pass 1: create/update; pass 2: link parents) ---
  const [cats] = (await db.query('SELECT id, name, slug, parentId, protype, discription FROM categories')) as any
  for (const c of cats) {
    await upsertByLegacyId(payload, 'categories', c.id, {
      name: clean(c.name) ?? `Category ${c.id}`,
      slug: clean(c.slug) ?? slugify(clean(c.name) ?? `category-${c.id}`),
      productKind: c.protype === 'gp' || c.protype === 'cp' ? c.protype : undefined,
      description: clean(c.discription),
    })
  }
  // map legacy id -> new payload id, then set parent where parentId != 0
  const idMap = new Map<number, string>()
  const all = await payload.find({ collection: 'categories', limit: 1000, depth: 0 })
  for (const d of all.docs) if (d.legacyId != null) idMap.set(Number(d.legacyId), d.id)
  let linked = 0
  for (const c of cats) {
    if (c.parentId && Number(c.parentId) !== 0 && idMap.has(Number(c.parentId)) && idMap.has(Number(c.id))) {
      await payload.update({
        collection: 'categories',
        id: idMap.get(Number(c.id)),
        data: { parent: idMap.get(Number(c.parentId)) },
        depth: 0,
      })
      linked++
    }
  }
  console.log(`categories: ${cats.length} processed, ${linked} parent links`)

  await db.end()
  const counts = await Promise.all(
    ['applications', 'industries', 'brands', 'categories'].map(async (c) => `${c}=${(await payload.count({ collection: c as any })).totalDocs}`),
  )
  console.log('FINAL:', counts.join(' '))
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
