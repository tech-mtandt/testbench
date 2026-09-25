/**
 * Media ingest + product image backfill (standard products; kind='standard').
 *  - reads image/bannerImage/catalogs (bare string OR JSON array) + productimages gallery
 *  - uploads each referenced file that exists on disk to Media (deduped by sourceName -> idempotent)
 *  - backfills each product's mainImage / bannerImage / gallery / catalogue
 * Custom-product galleries (coustomeproductgallerys) are a separate later pass.
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/ingest-media.mts
 * Limit for a test:  LIMIT=10 <same>
 */
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { existsSync } from 'fs'
import path from 'path'

const IMG_DIR = 'd:/LeverageAxioms/mtandt/website/public/imageFile'

// parse a legacy image column: JSON array of names, or a single bare filename
function parseFiles(v: unknown): string[] {
  const s = clean(v)
  if (!s || s === '[]') return []
  if (s.startsWith('[')) {
    try { const a = JSON.parse(s); if (Array.isArray(a)) return a.map(String).map((x) => x.trim()).filter(Boolean) } catch {}
  }
  return [s]
}
const onDisk = (f: string) => existsSync(path.join(IMG_DIR, f))

async function pool<T>(items: T[], conc: number, fn: (t: T) => Promise<void>) {
  const q = [...items]
  await Promise.all(Array.from({ length: conc }, async () => { while (q.length) await fn(q.shift()!) }))
}

async function main() {
  const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0
  const payload = await boot()
  const db = await mysqlConn()

  // standard products with their legacy source ids
  let prods = (await payload.find({ collection: 'products', where: { kind: { equals: 'standard' } }, limit: 1000, depth: 0, draft: true })).docs as any[]
  if (LIMIT) prods = prods.slice(0, LIMIT)
  const srcIds = [...new Set(prods.flatMap((p) => (p.legacySourceIds || []).map(Number)))]
  if (!srcIds.length) { console.log('no products'); process.exit(0) }

  const [prodRows] = (await db.query(`SELECT id,image,bannerImage,catalogs FROM products WHERE id IN (${srcIds.join(',')})`)) as any
  const [imgRows] = (await db.query(`SELECT productid,image FROM productimages WHERE productid IN (${srcIds.join(',')})`)) as any
  const prodById = new Map<number, any>(prodRows.map((r: any) => [Number(r.id), r]))
  const galleryBySrc = new Map<number, string[]>()
  for (const r of imgRows) { const f = clean(r.image); if (f && onDisk(f)) { const k = Number(r.productid); if (!galleryBySrc.has(k)) galleryBySrc.set(k, []); galleryBySrc.get(k)!.push(f) } }

  // collect every unique file we need, that exists on disk
  const needed = new Set<string>()
  const addIf = (f?: string) => { if (f && onDisk(f)) needed.add(f) }
  for (const r of prodRows) { parseFiles(r.image).forEach(addIf); parseFiles(r.bannerImage).forEach(addIf); parseFiles(r.catalogs).forEach(addIf) }
  for (const arr of galleryBySrc.values()) arr.forEach((f) => needed.add(f))
  console.log(`products: ${prods.length} | unique files to ensure in Media: ${needed.size}`)

  // upload (idempotent by sourceName)
  const mediaId = new Map<string, string>()
  const existing = await payload.find({ collection: 'media', where: { sourceName: { in: [...needed] } }, limit: 5000, depth: 0 })
  for (const m of existing.docs as any[]) if (m.sourceName) mediaId.set(m.sourceName, m.id)
  const toUpload = [...needed].filter((f) => !mediaId.has(f))
  console.log(`  already uploaded: ${mediaId.size} | uploading: ${toUpload.length}`)
  let up = 0, failed = 0
  await pool(toUpload, 10, async (f) => {
    try {
      const doc = await payload.create({ collection: 'media', data: { sourceName: f, alt: f }, filePath: path.join(IMG_DIR, f), depth: 0 })
      mediaId.set(f, doc.id); if (++up % 25 === 0) console.log(`    uploaded ${up}/${toUpload.length}`)
    } catch (e) { failed++; if (failed <= 5) console.log(`    upload FAILED ${f}: ${(e as Error).message}`) }
  })
  console.log(`  uploaded ${up}, failed ${failed}`)

  // backfill product relations
  let filled = 0
  await pool(prods, 10, async (p) => {
    const ids: number[] = (p.legacySourceIds || []).map(Number)
    const rows = ids.map((i) => prodById.get(i)).filter(Boolean)
    const mainCand = rows.flatMap((r) => parseFiles(r.image)).find((f) => mediaId.has(f))
    const banners = rows.flatMap((r) => parseFiles(r.bannerImage)).filter((f) => mediaId.has(f))
    const pdf = rows.flatMap((r) => parseFiles(r.catalogs)).find((f) => mediaId.has(f) && /\.pdf$/i.test(f))
    const gallery = [...new Set(ids.flatMap((i) => galleryBySrc.get(i) || []))].filter((f) => mediaId.has(f)).map((f) => mediaId.get(f)!)
    const data: Record<string, unknown> = {}
    if (mainCand) data.mainImage = mediaId.get(mainCand)
    if (banners[0]) data.bannerImage = mediaId.get(banners[0])
    if (gallery.length) data.gallery = gallery
    if (pdf) data.catalogue = mediaId.get(pdf)
    if (Object.keys(data).length) { await payload.update({ collection: 'products', id: p.id, data, depth: 0 }); filled++ }
  })
  console.log(`\nDONE: ${filled}/${prods.length} products backfilled with media.`)
  await db.end()
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
