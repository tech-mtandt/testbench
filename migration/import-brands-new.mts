/**
 * Brands -> redesign `brands` (title unique, logo, description, category, link).
 * Source: tempbrands (17 names). Only title available in legacy. Idempotent upsert by title.
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-brands-new.mts
 */
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'

async function main() {
  const payload: any = await boot()
  const db = await mysqlConn()
  const [rows] = (await db.query('SELECT id,name FROM tempbrands')) as any
  let n = 0
  for (const b of rows) {
    const title = clean(b.name); if (!title) continue
    const ex = await payload.find({ collection: 'brands', where: { title: { equals: title } }, limit: 1, depth: 0 })
    if (!ex.docs.length) { await payload.create({ collection: 'brands', data: { title }, depth: 0 }); n++ }
  }
  await db.end()
  console.log(`brands: ${n} created -> total ${(await payload.count({ collection: 'brands' })).totalDocs}`)
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
