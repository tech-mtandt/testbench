/**
 * Blogs -> redesign `blogs` collection. INSERT-ONLY, additive, non-destructive:
 *  - skips any legacy blog whose slug already exists (never updates/overwrites existing rows)
 *  - only writes to `blogs` (+ additive `media` uploads). No schema changes, no migrations.
 * Source: legacy blogs (116). body is required richText -> HTML converted, with a
 * title fallback when the legacy description is empty.
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-blogs-new.mts
 */
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean, parseIdArray } from './lib/mysql.mjs'
import { ensureMedia } from './lib/media.mjs'
import { makeHtmlToLexical } from './lib/html-to-lexical.mjs'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const plain = (html?: unknown) => { const s = html == null ? '' : String(html); return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() }
// remove inline media/scripts so the converter can't emit invalid upload nodes
const stripMedia = (html?: unknown) => String(html ?? '')
  .replace(/<img[^>]*>/gi, '').replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
// a guaranteed-valid, non-empty Lexical state from plain text (body is required)
const paragraphState = (text: string) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
    children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr',
      children: [{ type: 'text', text: text || ' ', format: 0, style: '', mode: 'normal', detail: 0, version: 1 }] }] },
})
const hasText = (state: any) => JSON.stringify(state?.root?.children ?? []).includes('"text"')

async function main() {
  const payload: any = await boot()
  const db = await mysqlConn()
  const toLexical = await makeHtmlToLexical(payload)
  const mc = new Map<string, string | null>()

  // existing slugs -> never touch these
  const existing = await payload.find({ collection: 'blogs', limit: 1000, depth: 0 })
  const usedSlugs = new Set<string>(existing.docs.map((d: any) => d.slug).filter(Boolean))
  console.log(`existing blogs to preserve: ${existing.docs.length}`)

  // tag id -> name (for the text `category` field)
  const [tagRows] = (await db.query('SELECT id,tagName FROM tags')) as any
  const tagName = new Map<number, string>(tagRows.map((t: any) => [Number(t.id), clean(t.tagName)]).filter((x: any) => x[1]))

  const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0
  const [blogs] = (await db.query('SELECT * FROM blogs')) as any
  let created = 0, skipped = 0, failed = 0
  for (const b of blogs) {
    if (LIMIT && created >= LIMIT) break
    let slug = clean(b.slug) ?? slugify(clean(b.title) ?? `blog-${b.id}`)
    if (usedSlugs.has(slug)) { skipped++; continue } // preserve existing / avoid dupes
    usedSlugs.add(slug)

    const title = clean(b.title) ?? clean(b.heading) ?? `Blog ${b.id}`
    const descHtml = stripMedia(b.description)
    let body: any = toLexical(descHtml)
    if (!clean(descHtml) || !hasText(body)) body = paragraphState(plain(b.description) || title)
    const hero = await ensureMedia(payload, b.image, mc)
    const cat = parseIdArray(b.tag).map((id) => tagName.get(id)).find(Boolean)
    const ts = parseInt(String(b.date), 10)

    try {
      await payload.create({ collection: 'blogs', data: {
        title, slug,
        hero, thumbnail: hero,
        excerpt: plain(b.description).slice(0, 300) || undefined,
        body,
        category: cat,
        publishedDate: Number.isFinite(ts) && ts > 0 ? new Date(ts * 1000).toISOString() : undefined,
        _status: 'published',
      }, depth: 0 })
      created++
      if (created % 25 === 0) console.log(`  ...created ${created}`)
    } catch (e: any) {
      failed++
      const errs = e?.data?.errors ?? e?.cause?.errors ?? []
      console.log(`  blog #${b.id} "${title}" FAIL: ${errs.length ? JSON.stringify(errs.map((x: any) => ({ f: x.path ?? x.field, m: x.message }))) : (e?.message || '').split('\n')[0]}`)
    }
  }

  await db.end()
  const total = (await payload.count({ collection: 'blogs' })).totalDocs
  console.log(`\nDONE: ${created} created, ${skipped} skipped (existing slug), ${failed} failed. blogs total now ${total}.`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
