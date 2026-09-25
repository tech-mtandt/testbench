/**
 * Batch C ETL: events (mediaevents), press (mediapresses), gallery (mediagalleries), catalogues.
 * Idempotent (upsert by legacyId). Images via ensureMedia. Gallery items are either an
 * uploaded image or a YouTube URL (branch on http).
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-content-c.mts
 */
import { boot, upsertByLegacyId } from './lib/payload.mjs'
import { mysqlConn, clean, parseIdArray } from './lib/mysql.mjs'
import { ensureMedia } from './lib/media.mjs'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const toDate = (v: unknown) => { const s = clean(v); if (!s) return undefined; const d = new Date(/^\d+$/.test(s) ? Number(s) * 1000 : s); return isNaN(+d) ? undefined : d.toISOString() }

async function main() {
  const payload = await boot()
  const db = await mysqlConn()
  const mc = new Map<string, string | null>()

  // ensure referenced tags exist (idempotent — reuses blog tags)
  const seedTags = async (rows: any[], col: string) => {
    const ids = new Set<number>(); for (const r of rows) parseIdArray(r[col]).forEach((i) => ids.add(i))
    const map = new Map<number, string>()
    if (!ids.size) return map
    const [ts] = (await db.query(`SELECT id,tagName,type FROM tags WHERE id IN (${[...ids].join(',')})`)) as any
    for (const t of ts) { if (!clean(t.tagName)) continue; const d = await upsertByLegacyId(payload, 'tags', t.id, { name: clean(t.tagName), type: clean(t.type) }); map.set(Number(t.id), d.id) }
    return map
  }

  // ---- Events ----
  const [ev] = (await db.query('SELECT * FROM mediaevents')) as any
  const evTags = await seedTags(ev, 'tag'); let n = 0
  for (const e of ev) {
    await upsertByLegacyId(payload, 'events', e.id, {
      title: clean(e.heading) ?? `Event ${e.id}`,
      slug: clean(e.slug) ?? slugify(clean(e.heading) ?? `event-${e.id}`),
      location: clean(e.location),
      dateFrom: toDate(e.form), dateTo: toDate(e.too),
      image: await ensureMedia(payload, e.image, mc),
      bannerImage: await ensureMedia(payload, e.banner_image, mc),
      video: clean(e.video),
      descriptionHtml: e.description ? String(e.description) : undefined,
      tags: parseIdArray(e.tag).map((i) => evTags.get(i)).filter(Boolean),
      meta: { title: clean(e.meta_title), description: clean(e.meta_discription), keywords: clean(e.meta_keyword) },
    }); n++
  }
  console.log(`events: ${n}`)

  // ---- Press ----
  const [pr] = (await db.query('SELECT * FROM mediapresses')) as any
  const prTags = await seedTags(pr, 'tag'); n = 0
  for (const p of pr) {
    await upsertByLegacyId(payload, 'press', p.id, {
      title: clean(p.title) ?? clean(p.heading) ?? `Press ${p.id}`,
      slug: clean(p.slug) ?? slugify(clean(p.title) ?? `press-${p.id}`),
      image: await ensureMedia(payload, p.image, mc),
      externalLink: clean(p.link) ?? clean(p.imageUrl),
      publishedDate: toDate(p.date),
      descriptionHtml: p.innerDescription ? String(p.innerDescription) : undefined,
      tags: parseIdArray(p.tag).map((i) => prTags.get(i)).filter(Boolean),
      meta: { title: clean(p.mete_title), description: clean(p.meta_description), keywords: clean(p.meta_keyword) },
    }); n++
  }
  console.log(`press: ${n}`)

  // ---- Gallery ----
  const [gal] = (await db.query('SELECT * FROM mediagalleries')) as any; n = 0
  for (const g of gal) {
    const raw = clean(g.image)
    const isVideo = !!raw && /^https?:\/\//i.test(raw)
    await upsertByLegacyId(payload, 'gallery', g.id, {
      caption: clean(g.image_name),
      mediaType: isVideo ? 'video' : 'image',
      videoUrl: isVideo ? raw : undefined,
      image: isVideo ? undefined : await ensureMedia(payload, g.image, mc),
    }); n++
  }
  console.log(`gallery: ${n}`)

  // ---- Catalogues ----
  const [cat] = (await db.query('SELECT * FROM catalogues')) as any; n = 0
  for (const c of cat) {
    await upsertByLegacyId(payload, 'catalogues', c.id, {
      name: clean(c.name) ?? `Catalogue ${c.id}`,
      coverImage: await ensureMedia(payload, c.imagefile, mc),
      file: await ensureMedia(payload, c.zipfile, mc),
      sortOrder: c.sort_order != null ? Number(c.sort_order) : undefined,
    }); n++
  }
  console.log(`catalogues: ${n}`)

  await db.end()
  console.log('\nBatch C DONE.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
