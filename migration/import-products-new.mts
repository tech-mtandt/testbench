/**
 * Re-add products into the REDESIGN schema (title/slug/featuredImage/content),
 * filtered to the Yes rows of the marked sheet. Standard + custom Yes.
 * Match key: sheet "DB ID" -> products.id (standard) / coustomeproducts.id (custom).
 * Idempotent: upsert by slug (new Products has no legacyId; slug is unique).
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-products-new.mts
 */
import { readFileSync } from 'fs'
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { ensureMedia } from './lib/media.mjs'
import { makeHtmlToLexical } from './lib/html-to-lexical.mjs'

const SHEET = 'd:/LeverageAxioms/mtandt/Product Catalog New - Sheet1.csv'
function parseCSV(t: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], f = '', q = false
  for (let i = 0; i < t.length; i++) { const c = t[i]
    if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++ } else if (c === '"') q = false; else f += c }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = '' }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = '' } else if (c === '\r') {} else f += c }
  if (f !== '' || row.length) { row.push(f); rows.push(row) }
  return rows
}
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const stripSlug = (s: string) => s.replace(/^(buy-|rental-)/, '')

async function main() {
  // 1) Yes DB IDs from the sheet
  const rows = parseCSV(readFileSync(SHEET, 'utf8'))
  const H = rows.shift()!.map((h) => h.trim())
  const iKeep = H.findIndex((h) => h.toLowerCase() === 'keep?'), iId = H.findIndex((h) => h.toLowerCase() === 'db id')
  const yes = new Set<number>()
  for (const r of rows) { if ((r[iKeep] || '').trim().toLowerCase() === 'yes') { const id = parseInt((r[iId] || '').trim(), 10); if (Number.isFinite(id)) yes.add(id) } }
  const yesList = [...yes]
  console.log(`Yes DB IDs in sheet: ${yesList.length}`)

  const payload = await boot()
  const db = await mysqlConn()
  const toLexical = await makeHtmlToLexical(payload)
  const mc = new Map<string, string | null>()
  const usedSlugs = new Set<string>()

  const upsertBySlug = async (slug: string, data: any) => {
    const ex = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    if (ex.docs.length) return payload.update({ collection: 'products', id: ex.docs[0].id, data, depth: 0 })
    return payload.create({ collection: 'products', data: { ...data, slug }, depth: 0 })
  }
  const uniqueSlug = (base: string, id: number) => { let s = base || `product-${id}`; if (usedSlugs.has(s)) s = `${s}-${id}`; usedSlugs.add(s); return s }

  // 2) STANDARD Yes products (merge buy/rent by name+cat+subcat)
  const [std] = (await db.query(`SELECT id,name,slug,image,description,categoryId,subcategoryId,catType FROM products WHERE id IN (${yesList.join(',') || 0})`)) as any
  const gStd = new Map<string, any[]>()
  for (const r of std) { const k = `${String(r.name).toLowerCase().trim()}|${r.categoryId}|${r.subcategoryId}`; if (!gStd.has(k)) gStd.set(k, []); gStd.get(k)!.push(r) }
  let nStd = 0
  for (const g of gStd.values()) {
    const c = g.find((r) => r.catType === 1) ?? g[0]
    const slug = uniqueSlug(stripSlug(clean(c.slug) ?? slugify(String(c.name))), c.id)
    await upsertBySlug(slug, {
      title: clean(c.name) ?? `Product ${c.id}`,
      featuredImage: await ensureMedia(payload, g.map((r) => r.image).find((i) => clean(i)), mc),
      content: toLexical(g.map((r) => r.description).find((d) => clean(d))),
    }); nStd++
  }
  console.log(`standard products: ${gStd.size} unique -> upserted ${nStd}`)

  // 3) CUSTOM Yes products (merge buy/rent by name+productId)
  const [cus] = (await db.query(`SELECT id,name,discription,productId,protype FROM coustomeproducts WHERE id IN (${yesList.join(',') || 0})`)) as any
  const gCus = new Map<string, any[]>()
  for (const r of cus) { if (!clean(r.name)) continue; const k = `${String(r.name).toLowerCase().trim()}|${r.productId}`; if (!gCus.has(k)) gCus.set(k, []); gCus.get(k)!.push(r) }
  let nCus = 0
  for (const g of gCus.values()) {
    const c = g[0]
    const slug = uniqueSlug(slugify(String(c.name)), c.id)
    await upsertBySlug(slug, {
      title: clean(c.name)!,
      content: toLexical(g.map((r) => r.discription).find((d) => clean(d))),
    }); nCus++
  }
  console.log(`custom products: ${gCus.size} unique -> upserted ${nCus}`)

  await db.end()
  const total = (await payload.count({ collection: 'products' })).totalDocs
  console.log(`\nDONE: products in new schema now ${total} (standard ${nStd} + custom ${nCus}).`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
