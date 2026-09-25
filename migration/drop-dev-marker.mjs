import pg from 'pg'
import { readFileSync } from 'fs'
const url = readFileSync('.env','utf8').match(/DATABASE_URL=(.+)/)[1].trim()
const c = new pg.Client({ connectionString: url, ssl:{ rejectUnauthorized:false } })
await c.connect()
const d = await c.query("delete from payload_migrations where name='dev' and batch='-1'")
console.log('deleted dev marker rows:', d.rowCount)
const r = await c.query('select id,name,batch from payload_migrations order by id')
r.rows.forEach(x=>console.log('  ',JSON.stringify(x)))
await c.end()
