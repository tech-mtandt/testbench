/**
 * Applies the marked "Product Catalog New" sheet to Payload products:
 *   - a merged product is PUBLISHED if ANY of its legacySourceIds is marked Yes
 *   - otherwise it is set to DRAFT (unpublished, recoverable)
 * Match key: sheet "DB ID" -> product.legacySourceIds (legacy MySQL product ids).
 * Custom-product ids won't match (not migrated yet) and are reported as unmatched.
 *
 * Dry run (default, no writes):  node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/apply-keep.mts
 * Apply:                         APPLY=1 <same command>
 */
import { readFileSync } from 'fs'
import { boot } from './lib/payload.mjs'

const SHEET = 'd:/LeverageAxioms/mtandt/Product Catalog New - Sheet1.csv'

// tiny CSV parser (handles quoted fields + commas)
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') q = false
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c === '\r') { /* skip */ }
    else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

async function main() {
  const APPLY = process.env.APPLY === '1'
  const rows = parseCSV(readFileSync(SHEET, 'utf8'))
  const header = rows.shift()!
  const ci = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase())
  const iKeep = ci('Keep?'), iId = ci('DB ID')

  const keepById = new Map<number, string>() // legacyId -> yes/no/''
  for (const r of rows) {
    const id = parseInt((r[iId] || '').trim(), 10)
    if (!Number.isFinite(id)) continue
    keepById.set(id, (r[iKeep] || '').trim().toLowerCase())
  }
  const yesIds = new Set([...keepById].filter(([, v]) => v === 'yes').map(([k]) => k))

  const payload = await boot()
  const all = await payload.find({ collection: 'products', limit: 1000, depth: 0, draft: true })
  let toPublish: any[] = [], toDraft: any[] = []
  const matchedSheetIds = new Set<number>()
  for (const p of all.docs as any[]) {
    const src: number[] = Array.isArray(p.legacySourceIds) ? p.legacySourceIds.map(Number) : []
    src.forEach((id) => { if (keepById.has(id)) matchedSheetIds.add(id) })
    const keep = src.some((id) => yesIds.has(id))
    ;(keep ? toPublish : toDraft).push(p)
  }
  const unmatched = [...keepById.keys()].filter((id) => !matchedSheetIds.has(id))

  console.log(`Payload products: ${all.docs.length}`)
  console.log(`  -> PUBLISH (>=1 source row = Yes): ${toPublish.length}`)
  console.log(`  -> DRAFT   (no Yes among sources): ${toDraft.length}`)
  console.log(`Sheet: ${keepById.size} DB IDs (${yesIds.size} Yes). Unmatched to any Payload product: ${unmatched.length}`)
  console.log(`  (unmatched = custom products not yet migrated + dropped junk)`)

  if (!APPLY) { console.log('\nDRY RUN — no changes written. Re-run with APPLY=1 to apply.'); return }

  // parallel pool — sequential updates over the remote link are too slow (~2s each)
  const jobs = [
    ...toPublish.map((p) => ({ p, status: 'published' })),
    ...toDraft.map((p) => ({ p, status: 'draft' })),
  ]
  let done = 0
  const CONC = 12
  async function worker(queue: typeof jobs) {
    while (queue.length) {
      const job = queue.shift()!
      await payload.update({ collection: 'products', id: job.p.id, data: { _status: job.status }, depth: 0 })
      if (++done % 25 === 0) console.log(`  ...${done}/${jobs.length}`)
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker(jobs)))
  console.log(`\nAPPLIED: ${done} products updated (${toPublish.length} published, ${toDraft.length} draft).`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
