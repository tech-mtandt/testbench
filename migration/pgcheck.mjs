import pg from 'pg'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const env = readFileSync(path.join(root, '.env'), 'utf8')
const url = env.match(/DATABASE_URL=(.+)/)[1].trim()
const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
await c.connect()
const v = await c.query('select version()')
console.log('CONNECTED:', v.rows[0].version.split(',')[0])
const t = await c.query("select table_name from information_schema.tables where table_schema='public' order by table_name")
console.log('PUBLIC TABLES ('+t.rowCount+'):', t.rows.map(r=>r.table_name).join(', ') || '(none)')
await c.end()
