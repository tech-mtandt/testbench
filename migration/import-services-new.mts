/**
 * Services -> redesign `services` (title, slug, hero, poster, body richText).
 * Source: legacy services (21). Idempotent upsert by slug.
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-services-new.mts
 */
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { ensureMedia } from './lib/media.mjs'
import { makeHtmlToLexical } from './lib/html-to-lexical.mjs'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

async function main() {
  const payload: any = await boot()
  const db = await mysqlConn()
  const toLexical = await makeHtmlToLexical(payload)
  const mc = new Map<string, string | null>()
  const used = new Set<string>()
  const [svc] = (await db.query('SELECT * FROM services')) as any
  let n = 0
  for (const s of svc) {
    let slug = clean(s.slug) ?? slugify(String(s.heading ?? `service-${s.id}`))
    if (used.has(slug)) slug = `${slug}-${s.id}`; used.add(slug)
    const data: any = {
      title: clean(s.heading) ?? `Service ${s.id}`,
      hero: await ensureMedia(payload, s.image, mc),
      poster: await ensureMedia(payload, s.headerImg, mc),
      body: toLexical(clean(s.innerDis) ?? clean(s.sortDescription)),
    }
    const ex = await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    if (ex.docs.length) await payload.update({ collection: 'services', id: ex.docs[0].id, data, depth: 0 })
    else await payload.create({ collection: 'services', data: { ...data, slug }, depth: 0 })
    n++
  }
  await db.end()
  console.log(`services: ${n} upserted -> total ${(await payload.count({ collection: 'services' })).totalDocs}`)
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
