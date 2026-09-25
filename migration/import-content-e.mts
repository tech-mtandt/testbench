/**
 * Batch E: enrich existing products + categories with detail satellites.
 *  - standard products: features/options/specChart (products cols) + faqs (productextrafeilds)
 *  - custom products: benefits/customFeatures/customerJourney/clientLogos (coustome* satellites)
 *  - categories: landingDescription + faqs (categorydeteils)
 * Skipped (sparse/duplicate/filter-only): productspecificaions, specifications, standardfeatures,
 *   productoptions, and the filter taxonomy lookups (primarytypes/powertypes/etc).
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-content-e.mts
 */
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { ensureMedia } from './lib/media.mjs'

const strArr = (v: unknown): string[] => { const s = clean(v); if (!s || !s.startsWith('[')) return []; try { const a = JSON.parse(s); return Array.isArray(a) ? a.map((x) => String(x)) : [] } catch { return [] } }
const html = (v: unknown) => { const s = v == null ? '' : String(v).trim(); return s && s !== 'null' ? s : undefined }

async function main() {
  const payload = await boot()
  const db = await mysqlConn()
  const mc = new Map<string, string | null>()

  // ===== Standard products =====
  const std = (await payload.find({ collection: 'products', where: { kind: { equals: 'standard' } }, limit: 1000, depth: 0, draft: true })).docs as any[]
  const srcIds = [...new Set(std.flatMap((p) => (p.legacySourceIds || []).map(Number)))]
  const [pcols] = (await db.query(`SELECT id,standard_features,options,chart FROM products WHERE id IN (${srcIds.join(',')})`)) as any
  const pById = new Map<number, any>(pcols.map((r: any) => [Number(r.id), r]))
  const [xf] = (await db.query(`SELECT productId,heading1,ans1,heading2,ans2,heading3,ans3 FROM productextrafeilds WHERE productId IN (${srcIds.join(',')})`)) as any
  const faqBySrc = new Map<number, any[]>()
  for (const x of xf) {
    const list = [] as any[]
    for (const i of [1, 2, 3]) { const q = clean(x[`heading${i}`]); const a = clean(x[`ans${i}`]); if (q || a) list.push({ question: q, answer: a }) }
    if (list.length) faqBySrc.set(Number(x.productId), list)
  }
  let nStd = 0
  for (const p of std) {
    const ids: number[] = (p.legacySourceIds || []).map(Number)
    const rows = ids.map((i) => pById.get(i)).filter(Boolean)
    const data: any = {}
    const feat = rows.map((r) => html(r.standard_features)).find(Boolean); if (feat) data.features = feat
    const opt = rows.map((r) => html(r.options)).find(Boolean); if (opt) data.options = opt
    // specChart deferred: legacy chart HTML embeds megabytes of base64 images (fails validation).
    // TODO: extract those data URIs to Media in a later pass.
    const faqs = ids.flatMap((i) => faqBySrc.get(i) || []); if (faqs.length) data.faqs = faqs
    if (Object.keys(data).length) { try { await payload.update({ collection: 'products', id: p.id, data, depth: 0 }); nStd++ } catch (e) { console.log(`  std ${p.id} skip: ${(e as Error).message.split('\n')[0]}`) } }
  }
  console.log(`standard products enriched: ${nStd}`)

  // ===== Custom products =====
  const customs = (await payload.find({ collection: 'products', where: { kind: { equals: 'custom' } }, limit: 1000, depth: 0, draft: true })).docs as any[]
  const [cps] = (await db.query('SELECT id,productId FROM coustomeproducts')) as any
  const catByCpId = new Map<number, number>(cps.map((r: any) => [Number(r.id), Number(r.productId)]))
  const load = async (t: string, cols: string) => (await db.query(`SELECT ${cols} FROM ${t}`))[0] as any[]
  const ben = await load('coustomebenefits', 'productId,benefits')
  const feat = await load('coustomefeatures', 'productId,features')
  const cj = await load('coustomecustomerjourney', 'productid,title,discription')
  const oc = await load('coustomeourclients', 'productid,image')
  const byCat = (rows: any[], key: string) => { const m = new Map<number, any[]>(); for (const r of rows) { const k = Number(r[key]); if (!m.has(k)) m.set(k, []); m.get(k)!.push(r) } return m }
  const benByCat = byCat(ben, 'productId'), featByCat = byCat(feat, 'productId'), cjByCat = byCat(cj, 'productid'), ocByCat = byCat(oc, 'productid')
  let nCustom = 0
  for (const p of customs) {
    const cats = [...new Set(((p.legacySourceIds || []).map(Number)).map((id: number) => catByCpId.get(id)).filter(Boolean))] as number[]
    const cat = cats[0]; if (cat == null) continue
    const data: any = {}
    const b = html(benByCat.get(cat)?.[0]?.benefits); if (b) data.benefits = b
    const f = html(featByCat.get(cat)?.[0]?.features); if (f) data.customFeatures = f
    const journey = (cjByCat.get(cat) || []).map((r: any) => ({ title: clean(r.title), description: html(r.discription) })).filter((x: any) => x.title || x.description)
    if (journey.length) data.customerJourney = journey
    const logos: string[] = []
    for (const r of ocByCat.get(cat) || []) { const m = await ensureMedia(payload, r.image, mc); if (m) logos.push(m) }
    if (logos.length) data.clientLogos = logos
    if (Object.keys(data).length) { await payload.update({ collection: 'products', id: p.id, data, depth: 0 }); nCustom++ }
  }
  console.log(`custom products enriched: ${nCustom}`)

  // ===== Categories (landing copy + FAQs) =====
  const catDocs = (await payload.find({ collection: 'categories', limit: 1000, depth: 0 })).docs as any[]
  const catByLegacy = new Map<number, string>(); for (const c of catDocs) if (c.legacyId != null) catByLegacy.set(Number(c.legacyId), c.id)
  const [cd] = (await db.query('SELECT catid,discription,question,answer FROM categorydeteils')) as any
  let nCat = 0
  for (const d of cd) {
    const docId = catByLegacy.get(Number(d.catid)); if (!docId) continue
    const qs = strArr(d.question), as = strArr(d.answer)
    const faqs = qs.map((q, i) => ({ question: q, answer: as[i] ?? '' })).filter((f) => f.question)
    const data: any = {}
    const desc = html(d.discription); if (desc) data.landingDescription = desc
    if (faqs.length) data.faqs = faqs
    if (Object.keys(data).length) { await payload.update({ collection: 'categories', id: docId, data, depth: 0 }); nCat++ }
  }
  console.log(`categories enriched: ${nCat}`)

  await db.end()
  console.log('\nBatch E DONE.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
