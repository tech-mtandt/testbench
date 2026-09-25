/**
 * Re-add catalogues into the REDESIGN schema. Catalogues require poster (media) +
 * document (relation to Documents). Uploads each PDF into Documents, poster into Media.
 * Idempotent: catalogues upsert by title; documents/media dedup by filename/sourceName.
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-catalogues-new.mts
 */
import { existsSync } from 'fs'
import path from 'path'
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { ensureMedia, IMG_DIR, cleanFilename } from './lib/media.mjs'

async function ensureDocument(payload: any, raw: unknown, cache: Map<string, string | null>) {
  const f = cleanFilename(raw)
  if (!f) return null
  if (cache.has(f)) return cache.get(f) ?? null
  try {
    const ex = await payload.find({ collection: 'documents', where: { filename: { equals: f } }, limit: 1, depth: 0 })
    if (ex.docs.length) { cache.set(f, ex.docs[0].id); return ex.docs[0].id }
    if (!existsSync(path.join(IMG_DIR, f))) { cache.set(f, null); return null }
    const d = await payload.create({ collection: 'documents', data: {}, filePath: path.join(IMG_DIR, f), depth: 0 })
    cache.set(f, d.id); return d.id
  } catch (e) { console.log(`  doc skip "${f}": ${(e as Error).message.split('\n')[0]}`); cache.set(f, null); return null }
}

async function main() {
  const payload = await boot()
  const db = await mysqlConn()
  const mc = new Map<string, string | null>(), dc = new Map<string, string | null>()

  const [cats] = (await db.query('SELECT id,name,imagefile,zipfile,catId,subcat_id FROM catalogues ORDER BY sort_order')) as any
  let done = 0, skipped = 0
  for (const c of cats) {
    const poster = await ensureMedia(payload, c.imagefile, mc)
    const document = await ensureDocument(payload, c.zipfile, dc)
    if (!poster || !document) { skipped++; console.log(`  skip "${clean(c.name)}" (poster=${!!poster} document=${!!document})`); continue }
    const title = clean(c.name) ?? `Catalogue ${c.id}`
    const data: any = { title, poster, document }
    const ex = await payload.find({ collection: 'catalogues', where: { title: { equals: title } }, limit: 1, depth: 0 })
    if (ex.docs.length) await payload.update({ collection: 'catalogues', id: ex.docs[0].id, data, depth: 0 })
    else await payload.create({ collection: 'catalogues', data, depth: 0 })
    done++
  }
  await db.end()
  const total = (await payload.count({ collection: 'catalogues' })).totalDocs
  console.log(`\nDONE: ${done} catalogues upserted, ${skipped} skipped (missing poster/PDF). catalogues now ${total}.`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
