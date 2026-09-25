/**
 * Backfills gallery images for custom products from `coustomeproductgallerys`.
 * Join: gallery.productid == coustomeproducts.productId (a category id) -> the custom product.
 * Uploads images (dedup by Media.sourceName), appends to product.gallery.
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/ingest-custom-galleries.mts
 */
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { existsSync } from 'fs'
import path from 'path'

const IMG_DIR = 'd:/LeverageAxioms/mtandt/website/public/imageFile'
const onDisk = (f: string) => existsSync(path.join(IMG_DIR, f))
async function pool<T>(items: T[], conc: number, fn: (t: T) => Promise<void>) {
  const q = [...items]; await Promise.all(Array.from({ length: conc }, async () => { while (q.length) await fn(q.shift()!) }))
}

async function main() {
  const payload = await boot()
  const db = await mysqlConn()

  // custom products: map each legacy coustomeproducts.id -> product doc
  const customs = (await payload.find({ collection: 'products', where: { kind: { equals: 'custom' } }, limit: 1000, depth: 0, draft: true })).docs as any[]
  const docByCpId = new Map<number, any>()
  for (const p of customs) for (const s of (p.legacySourceIds || [])) docByCpId.set(Number(s), p)

  // coustomeproducts.productId (category id) -> [cp ids]
  const [cps] = (await db.query('SELECT id, productId FROM coustomeproducts')) as any
  const cpIdsByCategory = new Map<number, number[]>()
  for (const r of cps) { const k = Number(r.productId); if (!cpIdsByCategory.has(k)) cpIdsByCategory.set(k, []); cpIdsByCategory.get(k)!.push(Number(r.id)) }

  // galleries grouped by target product doc
  const [gals] = (await db.query('SELECT productid, image FROM coustomeproductgallerys')) as any
  const filesByDoc = new Map<string, Set<string>>()
  const needed = new Set<string>()
  let skipped = 0
  for (const g of gals) {
    const f = clean(g.image); if (!f || !onDisk(f)) { skipped++; continue }
    const cpIds = cpIdsByCategory.get(Number(g.productid)) || []
    const doc = cpIds.map((id) => docByCpId.get(id)).find(Boolean)
    if (!doc) { skipped++; continue }
    if (!filesByDoc.has(doc.id)) filesByDoc.set(doc.id, new Set())
    filesByDoc.get(doc.id)!.add(f); needed.add(f)
  }
  console.log(`gallery rows: ${gals.length} | matched to ${filesByDoc.size} custom products | unique images: ${needed.size} | skipped: ${skipped}`)

  // upload (idempotent by sourceName)
  const mediaId = new Map<string, string>()
  const existing = await payload.find({ collection: 'media', where: { sourceName: { in: [...needed] } }, limit: 5000, depth: 0 })
  for (const m of existing.docs as any[]) if (m.sourceName) mediaId.set(m.sourceName, m.id)
  const toUpload = [...needed].filter((f) => !mediaId.has(f))
  let up = 0, failed = 0
  await pool(toUpload, 10, async (f) => {
    try { const d = await payload.create({ collection: 'media', data: { sourceName: f, alt: f }, filePath: path.join(IMG_DIR, f), depth: 0 }); mediaId.set(f, d.id); up++ }
    catch (e) { failed++; if (failed <= 5) console.log(`  upload FAILED ${f}: ${(e as Error).message}`) }
  })
  console.log(`uploaded ${up}, failed ${failed}, reused ${existing.docs.length}`)

  // append to each product's gallery
  let filled = 0
  for (const [pid, files] of filesByDoc) {
    const cur = (await payload.findByID({ collection: 'products', id: pid, depth: 0, draft: true })) as any
    const existingIds = (cur.gallery || []).map((g: any) => (typeof g === 'object' ? g.id : g))
    const add = [...files].map((f) => mediaId.get(f)).filter(Boolean)
    const gallery = [...new Set([...existingIds, ...add])]
    await payload.update({ collection: 'products', id: pid, data: { gallery }, depth: 0 }); filled++
  }
  console.log(`\nDONE: ${filled} custom products backfilled with gallery images.`)
  await db.end()
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
