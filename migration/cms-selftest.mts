/**
 * Offline round-trip test of the CMS import + read layer — no database needed.
 *
 *   PAYLOAD_SECRET=x node --require ./migration/patch-next-env.cjs --import tsx migration/cms-selftest.mts [snapshotDir]
 *
 * 1. Boots Payload without a DB and swaps its Local API (find/create/update/findGlobal/
 *    updateGlobal) for an in-memory store that honours `where`, `sort` and `depth`.
 * 2. Reads every content getter with the store empty -> the scraped-JSON fallback.
 * 3. Runs every import task into the store (file downloads stubbed).
 * 4. Reads every getter again -> data mapped back from the CMS.
 * 5. Diffs 2 vs 4 (HTML compared as visible text) and, if a snapshot dir of live pages
 *    is given, checks each imported SEO title against the live <title>.
 */
import { AsyncLocalStorage } from 'node:async_hooks'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

// Next's server modules expect this global (set by the Next runtime).
;(globalThis as any).AsyncLocalStorage = AsyncLocalStorage
const config = await (await import('../src/payload.config')).default
const payload: any = await getPayload({ config, disableDBConnect: true })

// ---------------- in-memory Local API ----------------
const store = new Map<string, any[]>()
const globals = new Map<string, any>()
const ids = new Map<string, number>()
const rows = (c: string) => store.get(c) ?? (store.set(c, []), store.get(c)!)
const clone = <T,>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)))
const now = () => new Date().toISOString()

const get = (doc: any, key: string) => key.split('.').reduce((v, k) => (v == null ? v : v[k]), doc)
const idOf = (v: any) => (v && typeof v === 'object' ? v.id : v)
function match(doc: any, where: any): boolean {
  if (!where) return true
  return Object.entries(where).every(([k, cond]: [string, any]) => {
    if (k === 'and') return cond.every((w: any) => match(doc, w))
    if (k === 'or') return cond.some((w: any) => match(doc, w))
    const v = get(doc, k)
    return Object.entries(cond).every(([op, x]: [string, any]) => {
      const vals = Array.isArray(v) ? v.map(idOf) : [idOf(v)]
      switch (op) {
        case 'equals': return vals.some((y) => y == x) || (x === null && v == null)
        case 'not_equals': return !vals.some((y) => y == x)
        case 'in': return vals.some((y) => (x as any[]).some((z) => z == y))
        case 'not_in': return !vals.some((y) => (x as any[]).some((z) => z == y))
        case 'exists': return x ? v != null && v !== '' : v == null || v === ''
        case 'like': case 'contains': return String(v ?? '').toLowerCase().includes(String(x).toLowerCase())
        case 'greater_than': return v > x
        case 'less_than': return v < x
        default: throw new Error(`mock: unsupported where op ${op}`)
      }
    })
  })
}
function sortDocs(docs: any[], sort?: string | string[]) {
  const keys = (Array.isArray(sort) ? sort : sort ? [sort] : []).map((s) => (s.startsWith('-') ? [s.slice(1), -1] : [s, 1]) as const)
  return [...docs].sort((a, b) => {
    for (const [k, dir] of keys) {
      const x = get(a, k), y = get(b, k)
      if (x == y) continue
      if (x == null) return 1
      if (y == null) return -1
      return (x < y ? -1 : 1) * dir
    }
    return 0
  })
}

const collectionFields = (slug: string) => payload.collections[slug]?.config.fields ?? []
const globalFields = (slug: string) => payload.config.globals.find((g: any) => g.slug === slug)?.fields ?? []

function populate(data: any, fields: any[], depth: number): any {
  if (!data || depth <= 0) return data
  for (const f of fields) {
    if (f.type === 'tabs') {
      for (const t of f.tabs) {
        if (t.name) data[t.name] = populate(data[t.name] ?? {}, t.fields, depth)
        else populate(data, t.fields, depth)
      }
    } else if (['row', 'collapsible'].includes(f.type)) populate(data, f.fields, depth)
    else if (!f.name || data[f.name] == null) continue
    else if (f.type === 'group') populate(data[f.name], f.fields, depth)
    else if (f.type === 'array') data[f.name].forEach((r: any) => populate(r, f.fields, depth))
    else if ((f.type === 'upload' || f.type === 'relationship') && typeof f.relationTo === 'string') {
      const one = (v: any) => {
        const found = rows(f.relationTo).find((d) => d.id == idOf(v))
        return found ? populate(clone(found), collectionFields(f.relationTo), depth - 1) : v
      }
      data[f.name] = Array.isArray(data[f.name]) ? data[f.name].map(one) : one(data[f.name])
    }
  }
  return data
}
/** Default values + array row ids, roughly as Payload would store them. */
function normalize(data: any, fields: any[]) {
  for (const f of fields) {
    if (f.type === 'tabs') {
      for (const t of f.tabs) normalize(t.name ? (data[t.name] ??= {}) : data, t.fields)
    } else if (['row', 'collapsible'].includes(f.type)) normalize(data, f.fields)
    else if (!f.name) continue
    else if (data[f.name] === undefined && f.defaultValue !== undefined && typeof f.defaultValue !== 'function')
      data[f.name] = clone(f.defaultValue)
    else if (f.type === 'group' && data[f.name]) normalize(data[f.name], f.fields)
    else if (f.type === 'array' && Array.isArray(data[f.name]))
      data[f.name].forEach((r: any, i: number) => { r.id ??= `${f.name}-${i}`; normalize(r, f.fields) })
    if ((f.type === 'upload' || f.type === 'relationship') && data[f.name] != null)
      data[f.name] = Array.isArray(data[f.name]) ? data[f.name].map(idOf) : idOf(data[f.name])
  }
  return data
}

const ops = { find: 0, create: 0, update: 0, updateGlobal: 0 }
Object.assign(payload, {
  async find({ collection, where, sort, depth = 2, limit = 10, page = 1, pagination }: any) {
    ops.find++
    let docs = sortDocs(rows(collection).filter((d) => match(d, where)), sort)
    const total = docs.length
    if (limit && pagination !== false) docs = docs.slice((page - 1) * limit, page * limit)
    docs = docs.map((d) => populate(clone(d), collectionFields(collection), depth))
    return { docs, totalDocs: total, totalPages: Math.max(1, Math.ceil(total / (limit || total || 1))), page, limit }
  },
  async findByID({ collection, id, depth = 2, disableErrors }: any) {
    const d = rows(collection).find((x) => x.id == id)
    if (!d) {
      if (disableErrors) return null
      throw new Error('not found')
    }
    return populate(clone(d), collectionFields(collection), depth)
  },
  async create({ collection, data, file }: any) {
    ops.create++
    const id = (ids.get(collection) ?? 0) + 1
    ids.set(collection, id)
    const doc = { ...normalize(clone(data), collectionFields(collection)), id, createdAt: now(), updatedAt: now() }
    if (file) Object.assign(doc, { filename: file.name, mimeType: file.mimetype, url: `/api/${collection}/file/${file.name}` })
    rows(collection).push(doc)
    return clone(doc)
  },
  async update({ collection, id, data }: any) {
    ops.update++
    const d = rows(collection).find((x) => x.id == id)
    Object.assign(d, normalize(clone(data), collectionFields(collection)), { updatedAt: now() })
    return clone(d)
  },
  async findGlobal({ slug, depth = 2 }: any) {
    return populate(clone(globals.get(slug) ?? { globalType: slug }), globalFields(slug), depth)
  },
  async updateGlobal({ slug, data }: any) {
    ops.updateGlobal++
    const next = { ...(globals.get(slug) ?? {}), ...normalize(clone(data), globalFields(slug)), globalType: slug, updatedAt: now() }
    globals.set(slug, next)
    return clone(next)
  },
  async count({ collection, where }: any) {
    return { totalDocs: rows(collection).filter((d) => match(d, where)).length }
  },
})
// unstable_cache outside Next: a cache that never hits, so every read goes to the store.
;(globalThis as any).__incrementalCache = {
  generateCacheKey: async (k: string) => k,
  get: async () => null,
  set: async () => {},
  isOnDemandRevalidate: false,
}
// No network: every legacy file "downloads" as a few bytes.
globalThis.fetch = (async () => new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/jpeg' } })) as any

// ---------------- content snapshot through the read layer ----------------
const cms = {
  site: await import('../src/content/site'),
  home: await import('../src/content/home'),
  products: await import('../src/content/products'),
  custom: await import('../src/content/customProducts'),
  media: await import('../src/content/media'),
  industries: await import('../src/content/industries'),
  cases: await import('../src/content/caseStudies'),
  services: await import('../src/content/services'),
  catalogues: await import('../src/content/catalogues'),
  partner: await import('../src/content/partner-forms'),
  legal: await import('../src/content/legal'),
  annual: await import('../src/content/annual-returns'),
  about: await import('../src/ui/About/data'),
  career: await import('../src/ui/Career/data'),
  contact: await import('../src/ui/Contact/data'),
  read: await import('../src/cms/read'),
}

async function snapshot() {
  const s: Record<string, any> = {}
  const put = async (k: string, f: () => Promise<any>) => {
    try { s[k] = clone(await f()) } catch (e) { s[k] = `THREW: ${(e as Error).message}` }
  }
  await put('site', () => cms.site.getSite())
  await put('home', () => cms.home.getHome())
  const catalog: any = await cms.products.getCatalog()
  await put('products.categories', async () => catalog.categories)
  for (const p of catalog.products) await put(`product/${p.slug}`, () => cms.products.getProduct(p.slug))
  for (const { mode, category, subcategory } of (await cms.products.listingParams()) as any[])
    await put(`listing/${mode}/${category}/${subcategory}`, () => cms.products.getListing(mode, category, subcategory))
  for (const kind of ['buy', 'rental'] as const)
    for (const { category, slug } of (await cms.custom.customProductParams(kind)) as any[])
      await put(`custom/${kind}/${slug}`, () => cms.custom.getCustomProduct(kind, category, slug))
  await put('press', () => cms.media.pressItems())
  await put('events', () => cms.media.events())
  await put('mediaPages', () => cms.media.getMediaPages())
  await put('industries.index', () => cms.industries.getIndustryIndex())
  await put('industries.page', () => cms.industries.getIndustriesPage())
  for (const slug of await cms.industries.getIndustrySlugs()) await put(`industry/${slug}`, () => cms.industries.getIndustry(slug))
  for (const slug of await cms.cases.getCaseStudySlugs()) await put(`case/${slug}`, () => cms.cases.getCaseStudy(slug))
  for (const slug of await cms.services.getServiceSlugs()) await put(`service/${slug}`, () => cms.services.getService(slug))
  await put('services.list', () => cms.services.listServices())
  await put('services.page', () => cms.services.getServicesPage())
  await put('catalogues', () => cms.catalogues.getCatalogues())
  await put('catalogues.page', () => cms.catalogues.getCataloguesPage())
  for (const k of ['customers', 'dealer', 'vendors']) await put(`partner/${k}`, () => cms.partner.getPartnerPage(k as any))
  await put('legal', () => cms.legal.getLegalPages())
  await put('annual', () => cms.annual.getAnnualReturns())
  await put('about', async () => cms.about.aboutSections(await cms.read.readGlobal('about', 2)))
  await put('career', () => cms.career.getCareer())
  await put('contact', () => cms.contact.getContact())
  return s
}

console.log('== reading fallback (empty CMS)')
const before = await snapshot()

console.log('== importing into memory')
const { listTasks, runTask } = await import('../src/cms/import/run')
const importLog: string[] = []
for (const { key, label } of listTasks()) {
  let cursor: number | null = 0, calls = 0
  while (cursor !== null) {
    const r = await runTask(payload, key, cursor, false, 600_000)
    importLog.push(...r.log.map((l) => `[${key}] ${l}`))
    cursor = r.next
    if (++calls > 50) throw new Error(`task ${key} did not finish`)
  }
  console.log(`   ${label}: done`)
}
const problems = importLog.filter((l) => l.includes('!'))
console.log(`   ${ops.create} creates, ${ops.update} updates, ${ops.updateGlobal} globals, ${problems.length} warnings`)
problems.slice(0, 20).forEach((l) => console.log('   ' + l))

console.log('== re-running import (must change nothing)')
const opsBefore = { ...ops }
for (const { key } of listTasks()) {
  const o = { ...ops }
  let cursor: number | null = 0
  const log: string[] = []
  while (cursor !== null) {
    const r = await runTask(payload, key, cursor, false, 600_000)
    log.push(...r.log)
    cursor = r.next
  }
  if (ops.create > o.create || ops.update > o.update || ops.updateGlobal > o.updateGlobal)
    console.log(`   [${key}] +${ops.create - o.create} creates, +${ops.update - o.update} updates, +${ops.updateGlobal - o.updateGlobal} globals: ${log.filter((l) => !l.includes('skipped')).slice(0, 3).join(' / ')}`)
}
console.log(`   extra creates: ${ops.create - opsBefore.create}, updates: ${ops.update - opsBefore.update}, globals: ${ops.updateGlobal - opsBefore.updateGlobal}`)

console.log('== reading from CMS')
const after = await snapshot()

// ---------------- diff ----------------
const decode = (h: string) =>
  h.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
const isHtml = (s: string) => /<\/?[a-z][^>]*>/i.test(s)
// Fields that legitimately differ after import (ids, CMS-only extras).
const IGNORE = /(^|\.)(id|dbId|cms|seo|meta\.image|updatedAt|createdAt)$/

const diffs: string[] = []
function diff(a: any, b: any, p: string) {
  if (diffs.length > 400 || IGNORE.test(p)) return
  if (typeof a === 'string' && typeof b === 'string') {
    if (a === b) return
    if ((isHtml(a) || isHtml(b)) && decode(a) === decode(b)) return
    diffs.push(`${p}\n      fallback: ${JSON.stringify(a).slice(0, 160)}\n      cms     : ${JSON.stringify(b).slice(0, 160)}`)
  } else if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) diffs.push(`${p}: length ${a.length} -> ${b.length}`)
    for (let i = 0; i < Math.min(a.length, b.length); i++) diff(a[i], b[i], `${p}[${i}]`)
  } else if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], p ? `${p}.${k}` : k)
  } else if ((a ?? null) !== (b ?? null) && !(a === '' && b == null) && !(a == null && b === '')) {
    diffs.push(`${p}: ${JSON.stringify(a)?.slice(0, 120)} -> ${JSON.stringify(b)?.slice(0, 120)}`)
  }
}
for (const k of new Set([...Object.keys(before), ...Object.keys(after)])) diff(before[k], after[k], k)
console.log(`\n== ${Object.keys(before).length} content reads compared, ${diffs.length} differences`)
diffs.slice(0, 400).forEach((d) => console.log(' - ' + d))

// ---------------- SEO titles vs live <title> ----------------
const snapDir = process.argv[2]
if (snapDir) {
  const { areas } = await import('../src/cms/schema')
  const urlFor = (args: any) => {
    for (const a of areas) { const u = a.seo?.url?.(args); if (u) return u }
    if (args.globalSlug === 'about') return '/about-us'
    if (args.collectionSlug === 'services') return `/services/${args.doc.slug}`
    if (args.collectionSlug === 'blogs') return `/blogs/${args.doc.slug}`
    return undefined
  }
  const liveTitle = (u: string) => {
    const f = path.join(snapDir, u.replace(/[/?=]/g, '_') + '.html')
    if (!fs.existsSync(f)) return undefined
    const m = fs.readFileSync(f, 'utf8').match(/<title>([^<]*)<\/title>/)
    return m && decode(m[1])
  }
  let checked = 0
  const bad: string[] = []
  const check = (args: any, meta: any) => {
    if (!meta?.title) return
    const u = urlFor(args)
    const live = u && liveTitle(u)
    if (!live) return
    checked++
    if (decode(meta.title) !== live) bad.push(`${u}\n      live: ${live}\n      seo : ${meta.title}`)
  }
  for (const [c, docs] of store) for (const d of docs) check({ collectionSlug: c, doc: d }, d.meta)
  for (const [g, d] of globals) check({ globalSlug: g, doc: d }, d.meta)
  console.log(`\n== SEO titles: ${checked} checked against live pages, ${bad.length} differ`)
  bad.slice(0, 60).forEach((b) => console.log(' - ' + b))
}
process.exit(0)
