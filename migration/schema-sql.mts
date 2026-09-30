/**
 * Emit idempotent DDL for the current Payload schema — no database connection needed.
 *
 * The live schema has no committed snapshot (the baseline migration was never checked
 * in), so a normal diff migration can't be generated. Instead this builds the full
 * Drizzle schema from payload.config, renders CREATE statements, and rewrites them so
 * they are safe to run against a database that already has some or all of it:
 *   CREATE TABLE        -> CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS per column
 *   CREATE TYPE         -> wrapped in DO … EXCEPTION WHEN duplicate_object
 *   ADD CONSTRAINT (FK) -> wrapped in DO … EXCEPTION WHEN duplicate_object
 *   CREATE INDEX        -> CREATE INDEX IF NOT EXISTS
 *
 * Usage (only tables whose name starts with one of the prefixes are emitted):
 *   PAYLOAD_SECRET=x node --require ./migration/patch-next-env.cjs --import tsx \
 *     migration/schema-sql.mts home_ site_settings > out.sql
 */
import { getPayload } from 'payload'

const prefixes = process.argv.slice(2)
const config = await (await import('../src/payload.config')).default
const payload = await getPayload({ config, disableDBConnect: true })
const db: any = payload.db
const kit = db.requireDrizzleKit()

const empty = await kit.generateDrizzleJson({})
const full = await kit.generateDrizzleJson(db.schema)
const statements: string[] = await kit.generateMigration(empty, full)

const tableOf = (sql: string) => sql.match(/(?:TABLE|ON|TYPE)\s+(?:IF NOT EXISTS\s+)?"(?:public"\."|)([^"]+)"/)?.[1] ?? ''
const wanted = (t: string) => !prefixes.length || prefixes.some((p) => t === p || t.startsWith(p) || t.startsWith(`_${p}`))

// Already there -> skip silently. Anything else (e.g. existing rows violating a new FK or
// unique index) -> report and carry on, so one bad row can't roll back the whole script.
const guard = (sql: string) =>
  `DO $$ BEGIN\n  ${sql.replace(/;\s*$/, '')};\nEXCEPTION WHEN duplicate_object OR duplicate_table THEN null;\n  WHEN others THEN RAISE NOTICE 'skipped (%): %', SQLERRM, ${quote(sql.slice(0, 120))}; END $$;`
function quote(s: string) {
  return `'${s.replace(/'/g, "''")}'`
}

const out: string[] = []
for (const raw of statements) {
  const sql = raw.trim()
  if (sql.startsWith('CREATE TYPE')) {
    // enum names embed the table name: enum_<table>_<field>
    const name = sql.match(/TYPE\s+"public"\."([^"]+)"/)?.[1] ?? ''
    if (!prefixes.length || prefixes.some((p) => name.startsWith(`enum_${p}`) || name.startsWith(`enum__${p}`))) {
      out.push(guard(sql))
      // An enum that already exists may predate newly added options.
      for (const v of sql.match(/ENUM\s*\((.*)\)/)?.[1].match(/'(?:[^']|'')*'/g) ?? [])
        out.push(`ALTER TYPE "public"."${name}" ADD VALUE IF NOT EXISTS ${v};`)
    }
  } else if (sql.startsWith('CREATE TABLE')) {
    const table = tableOf(sql)
    if (!wanted(table)) continue
    out.push(sql.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS'))
    // Column lines look like: \t"name" type ... , skip table-level constraints.
    for (const line of sql.split('\n')) {
      const m = line.match(/^\s*"([^"]+)"\s+(.+?),?$/)
      if (!m || /PRIMARY KEY\s*\(/.test(line) || /^\s*CONSTRAINT/.test(line)) continue
      const def = m[2].replace(/\s+PRIMARY KEY/, '').replace(/,$/, '')
      // NOT NULL without a default would fail on a populated table; add it nullable.
      const safe = /DEFAULT/.test(def) ? def : def.replace(/\s+NOT NULL/, '')
      out.push(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${m[1]}" ${safe};`)
    }
  } else if (sql.startsWith('ALTER TABLE') && sql.includes('ADD CONSTRAINT')) {
    if (wanted(tableOf(sql))) out.push(guard(sql))
  } else if (sql.startsWith('CREATE INDEX')) {
    if (wanted(tableOf(sql))) out.push(sql.replace('CREATE INDEX', 'CREATE INDEX IF NOT EXISTS'))
  } else if (sql.startsWith('CREATE UNIQUE INDEX')) {
    if (wanted(tableOf(sql))) out.push(guard(sql.replace('CREATE UNIQUE INDEX', 'CREATE UNIQUE INDEX IF NOT EXISTS')))
  } else if (wanted(tableOf(sql))) {
    out.push(`-- unhandled, review: ${sql}`)
  }
}
console.log(out.join('\n'))
process.exit(0)
