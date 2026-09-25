/**
 * Batch H: bulk-load ~30k legacy lead rows into the read-only lead collections.
 * Direct MySQL -> Postgres (bypasses Payload for speed). TRUNCATE + insert = idempotent.
 * Nothing references these tables, so truncation is safe.
 *
 * Run from testbench/: node --env-file=.env migration/ingest-leads.mjs
 */
import mysql from 'mysql2/promise'
import pg from 'pg'
import { readFileSync } from 'fs'

const clean = (v) => { if (v == null) return null; const s = String(v).trim(); return s === '' || s === 'null' ? null : s }

const JOBS = [
  { table: 'enquiries', cols: ['page', 'name', 'email', 'enquiry', 'submitted_at', 'legacy_id'],
    sql: 'SELECT id,page,name,email,enquiry,created_at FROM getintouchs',
    map: (r) => [clean(r.page), clean(r.name), clean(r.email), clean(r.enquiry), r.created_at || null, r.id] },
  { table: 'newsletter_signups', cols: ['name', 'email', 'message', 'submitted_at', 'legacy_id'],
    sql: 'SELECT id,name,email,enquiry,created_at FROM subscriberusers',
    map: (r) => [clean(r.name), clean(r.email), clean(r.enquiry), r.created_at || null, r.id] },
  { table: 'catalogue_downloads', cols: ['name', 'email', 'company', 'phone', 'designation', 'location', 'catalogue', 'message', 'submitted_at', 'legacy_id'],
    sql: 'SELECT id,name,email,companyName,mNumber,designation,location,catalogName,message,created_at FROM cataloguedatas',
    map: (r) => [clean(r.name), clean(r.email), clean(r.companyName), clean(r.mNumber), clean(r.designation), clean(r.location), clean(r.catalogName), clean(r.message), r.created_at || null, r.id] },
  { table: 'partner_enquiries', cols: ['type', 'email', 'enquiry', 'submitted_at', 'legacy_id'],
    sql: 'SELECT id,type,email,enquiry,created_at FROM partnerenquiry',
    map: (r) => [clean(r.type), clean(r.email), clean(r.enquiry), r.created_at || null, r.id] },
  { table: 'career_applications', cols: ['name', 'email', 'enquiry', 'submitted_at', 'legacy_id'],
    sql: 'SELECT id,name,email,enquiry,created_at FROM careerenquerys',
    map: (r) => [clean(r.name), clean(r.email), clean(r.enquiry), r.created_at || null, r.id] },
  { table: 'product_enquiries', cols: ['name', 'email', 'company', 'phone', 'product', 'producttype', 'location', 'message', 'submitted_at', 'legacy_id'],
    sql: 'SELECT id,name,email,company_name,number,productName,productType,location,message,created_at FROM productenquiry',
    map: (r) => [clean(r.name), clean(r.email), clean(r.company_name), clean(r.number), clean(r.productName), clean(r.productType), clean(r.location), clean(r.message), r.created_at || null, r.id] },
  { table: 'feedback_submissions', cols: ['name', 'email', 'phone', 'company', 'category', 'message', 'submitted_at', 'legacy_id'],
    sql: 'SELECT id,full_name,email,phone,company_name,category,feedback,created_at FROM feedback',
    map: (r) => [clean(r.full_name), clean(r.email), clean(r.phone), clean(r.company_name), clean(r.category), clean(r.feedback), r.created_at || null, r.id] },
]

const url = readFileSync('.env', 'utf8').match(/DATABASE_URL=(.+)/)[1].trim()
const pgc = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
await pgc.connect()
const my = await mysql.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'mtandt_local', dateStrings: true })

for (const job of JOBS) {
  await pgc.query(`DELETE FROM ${job.table}`)
  const [rows] = await my.query(job.sql)
  const BATCH = 800
  let done = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH)
    const params = []
    const tuples = slice.map((r) => {
      const vals = job.map(r)
      const ph = vals.map((_, k) => `$${params.length + k + 1}`)
      params.push(...vals)
      return `(${ph.join(',')})`
    })
    await pgc.query(`INSERT INTO ${job.table} (${job.cols.join(',')}) VALUES ${tuples.join(',')}`, params)
    done += slice.length
  }
  console.log(`${job.table}: ${done} rows`)
}

await my.end(); await pgc.end()
console.log('\nBatch H DONE.')
