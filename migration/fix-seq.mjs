import pg from 'pg'
import { readFileSync } from 'fs'
const url = readFileSync('.env','utf8').match(/DATABASE_URL=(.+)/)[1].trim()
const c = new pg.Client({ connectionString: url, ssl:{ rejectUnauthorized:false } })
await c.connect()
const seq = await c.query(`select pg_get_serial_sequence('payload_migrations','id') as s`)
console.log('sequence:', seq.rows[0].s)
if(seq.rows[0].s){
  const r = await c.query(`select setval('${seq.rows[0].s}', (select coalesce(max(id),1) from payload_migrations))`)
  console.log('setval ->', r.rows[0].setval)
}
// did any batch_c tables get created (partial)?
const t = await c.query(`select table_name from information_schema.tables where table_schema='public' and table_name in ('events','press','gallery','catalogues')`)
console.log('batch_c tables present:', t.rows.map(x=>x.table_name).join(',')||'none')
await c.end()
