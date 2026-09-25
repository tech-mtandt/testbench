import pg from 'pg'
import { readFileSync } from 'fs'
const url = readFileSync('.env','utf8').match(/DATABASE_URL=(.+)/)[1].trim()
const c = new pg.Client({ connectionString: url, ssl:{ rejectUnauthorized:false } })
await c.connect()
const cols = await c.query(`select column_name, data_type from information_schema.columns where table_name='payload_migrations' order by ordinal_position`)
console.log('payload_migrations columns:'); cols.rows.forEach(r=>console.log('  ',r.column_name, r.data_type))
const rows = await c.query('select * from payload_migrations order by 1')
console.log('existing rows:', rows.rowCount)
rows.rows.forEach(r=>console.log('  ', JSON.stringify(r)))
await c.end()
