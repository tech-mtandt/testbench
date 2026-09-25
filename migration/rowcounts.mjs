import pg from 'pg'
import { readFileSync } from 'fs'
const url = readFileSync('.env','utf8').match(/DATABASE_URL=(.+)/)[1].trim()
const c = new pg.Client({ connectionString: url, ssl:{ rejectUnauthorized:false } })
await c.connect()
for(const t of ['categories','products','media','brands','industries','applications','blogs','services','team','testimonials','clients','tags','case_studies']){
  try { const r = await c.query(`select count(*)::int n from ${t}`); console.log(t.padEnd(16), r.rows[0].n) }
  catch(e){ console.log(t.padEnd(16), 'ERR', e.message.split('\n')[0]) }
}
await c.end()
