/**
 * Batch A+B ETL: blogs, services, case-studies, team, testimonials, clients (+ tags for blogs).
 * Idempotent (upsert by legacyId). Images via ensureMedia (dedup by sourceName).
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-content-ab.mts
 */
import { boot, upsertByLegacyId } from './lib/payload.mjs'
import { mysqlConn, clean, parseIdArray } from './lib/mysql.mjs'
import { ensureMedia } from './lib/media.mjs'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const jsonArr = (v: unknown): string[] => { const s = clean(v); if (!s || !s.startsWith('[')) return s ? [s] : []; try { const a = JSON.parse(s); return Array.isArray(a) ? a.map(String) : [] } catch { return [] } }

async function main() {
  const payload = await boot()
  const db = await mysqlConn()
  const mc = new Map<string, string | null>()

  // ---- Tags (only those referenced by blogs) ----
  const [blogRows] = (await db.query('SELECT * FROM blogs')) as any
  const neededTagIds = new Set<number>()
  for (const b of blogRows) parseIdArray(b.tag).forEach((id) => neededTagIds.add(id))
  const [tagRows] = neededTagIds.size
    ? (await db.query(`SELECT id, tagName, type FROM tags WHERE id IN (${[...neededTagIds].join(',')})`)) as any
    : [[]]
  const tagMap = new Map<number, string>()
  for (const t of tagRows) {
    if (!clean(t.tagName)) continue
    const doc = await upsertByLegacyId(payload, 'tags', t.id, { name: clean(t.tagName), type: clean(t.type) })
    tagMap.set(Number(t.id), doc.id)
  }
  console.log(`tags: ${tagMap.size} referenced tags`)

  // ---- Blogs ----
  let n = 0
  for (const b of blogRows) {
    const tags = parseIdArray(b.tag).map((id) => tagMap.get(id)).filter(Boolean)
    const ts = parseInt(String(b.date), 10)
    await upsertByLegacyId(payload, 'blogs', b.id, {
      title: clean(b.title) ?? `Blog ${b.id}`,
      slug: clean(b.slug) ?? slugify(clean(b.title) ?? `blog-${b.id}`),
      heading: clean(b.heading),
      coverImage: await ensureMedia(payload, b.image, mc),
      bodyHtml: b.description ? String(b.description) : undefined,
      tags,
      publishedDate: Number.isFinite(ts) && ts > 0 ? new Date(ts * 1000).toISOString() : undefined,
      meta: { title: clean(b.meta_title), description: clean(b.meta_discription), keywords: clean(b.meta_keyword), image: await ensureMedia(payload, b.meta_image, mc) },
    })
    n++
  }
  console.log(`blogs: ${n}`)

  // ---- Services ----
  const [svc] = (await db.query('SELECT * FROM services')) as any; n = 0
  for (const s of svc) {
    await upsertByLegacyId(payload, 'services', s.id, {
      title: clean(s.heading) ?? `Service ${s.id}`,
      slug: clean(s.slug) ?? slugify(clean(s.heading) ?? `service-${s.id}`),
      shortDescription: clean(s.sortDescription),
      bodyHtml: s.innerDis ? String(s.innerDis) : undefined,
      image: await ensureMedia(payload, s.image, mc),
      headerImage: await ensureMedia(payload, s.headerImg, mc),
      innerImage: await ensureMedia(payload, s.inner_image, mc),
      brochure: await ensureMedia(payload, s.brochure, mc),
      icons: jsonArr(s.icons).map((icon) => ({ icon })),
      visitUrl: clean(s.visitUrl),
      meta: { title: clean(s.meta_title), description: clean(s.meta_discription), keywords: clean(s.meta_keyword) },
    })
    n++
  }
  console.log(`services: ${n}`)

  // ---- Case studies ----
  const [cs] = (await db.query('SELECT * FROM newcasestudies')) as any; n = 0
  for (const c of cs) {
    await upsertByLegacyId(payload, 'case-studies', c.id, {
      title: clean(c.title) ?? `Case Study ${c.id}`,
      slug: clean(c.slug) ?? slugify(clean(c.title) ?? `case-${c.id}`),
      image: await ensureMedia(payload, c.image, mc),
      client: clean(c.client), location: clean(c.location), product: clean(c.product),
      application: clean(c.application), person: clean(c.name),
      descriptionHtml: c.description ? String(c.description) : undefined,
      challengeHtml: c.challenges ? String(c.challenges) : undefined,
      solutionHtml: c.solution ? String(c.solution) : undefined,
      resultHtml: c.result ? String(c.result) : undefined,
      file: await ensureMedia(payload, c.casestudiesfile, mc),
    })
    n++
  }
  console.log(`case-studies: ${n}`)

  // ---- Team ----
  const [team] = (await db.query('SELECT * FROM our_team')) as any; n = 0
  for (const t of team) {
    await upsertByLegacyId(payload, 'team', t.id, {
      name: clean(t.name) ?? `Member ${t.id}`,
      post: clean(t.post),
      photo: await ensureMedia(payload, t.image, mc),
      group: Number(t.category) === 1 ? 'leadership' : 'team',
      sortOrder: t.sort_order != null ? Number(t.sort_order) : undefined,
    })
    n++
  }
  console.log(`team: ${n}`)

  // ---- Testimonials ----
  const [tst] = (await db.query('SELECT * FROM testimonials')) as any; n = 0
  for (const t of tst) {
    await upsertByLegacyId(payload, 'testimonials', t.id, {
      authorName: clean(t.userName) ?? `Testimonial ${t.id}`,
      photo: await ensureMedia(payload, t.userImage, mc),
      quote: clean(t.userDescription),
    })
    n++
  }
  console.log(`testimonials: ${n}`)

  // ---- Clients ----
  const [cl] = (await db.query('SELECT * FROM clients')) as any; n = 0
  for (const c of cl) {
    await upsertByLegacyId(payload, 'clients', c.id, {
      name: clean(c.client_name),
      websiteUrl: clean(c.website_url),
      logo: await ensureMedia(payload, c.clientImage, mc),
    })
    n++
  }
  console.log(`clients: ${n}`)

  await db.end()
  console.log('\nBatch A+B DONE.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
