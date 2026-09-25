import pg from 'pg'
import { readFileSync } from 'fs'
const url = readFileSync('.env','utf8').match(/DATABASE_URL=(.+)/)[1].trim()
const c = new pg.Client({ connectionString: url, ssl:{ rejectUnauthorized:false } })
await c.connect()
await c.query(`INSERT INTO payload_migrations (id,name,batch,updated_at,created_at)
  SELECT COALESCE(MAX(id),0)+1, '20260811_193641_baseline', 1, now(), now() FROM payload_migrations
  WHERE NOT EXISTS (SELECT 1 FROM payload_migrations WHERE name='20260811_193641_baseline')`)
const r = await c.query('select id,name,batch from payload_migrations order by id')
console.log('payload_migrations now:'); r.rows.forEach(x=>console.log('  ',JSON.stringify(x)))
await c.end()
