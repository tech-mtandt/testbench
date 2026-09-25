/**
 * Applies the curation edits from the marked sheet to Payload products:
 *   - Rename Model Number       -> product.modelNo
 *   - Revised working height     -> specifications["Working Height"].value
 *   - Revised Platform height    -> specifications["Platform Height"].value
 *   - Rename Subcategory         -> rename the linked Category doc (custom products, 1:1)
 * FLAGGED, not applied: the 8 "Rename" -> "Equipment & Tools" (looks like a regroup, not a
 * rename) and rows with no DB ID. These are printed for review.
 *
 * Match key: sheet "DB ID" -> product.legacySourceIds.
 * Dry run (default):  node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/apply-curation.mts
 * Apply:              APPLY=1 <same>
 */
import { readFileSync } from 'fs'
import { boot } from './lib/payload.mjs'

const SHEET = 'd:/LeverageAxioms/mtandt/Product Catalog New - Sheet1.csv'
function parseCSV(t: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], f = '', q = false
  for (let i = 0; i < t.length; i++) { const c = t[i]
    if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++ } else if (c === '"') q = false; else f += c }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = '' }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = '' } else if (c === '\r') {} else f += c }
  if (f !== '' || row.length) { row.push(f); rows.push(row) }
  return rows
}

async function main() {
  const APPLY = process.env.APPLY === '1'
  const rows = parseCSV(readFileSync(SHEET, 'utf8'))
  const H = rows.shift()!.map((h) => h.trim())
  const ix = (n: string) => H.findIndex((h) => h.toLowerCase() === n.toLowerCase())
  const iId = ix('DB ID'), iModel = ix('Rename Model Number'), iWH = ix('Revised working heaight'),
    iPH = ix('Revised Platform height'), iSub = ix('Rename Subcategory'), iName = ix('Rename')

  const edits = new Map<number, any>()
  const flaggedNames: string[] = [], noId: string[] = []
  for (const r of rows) {
    if (r.length < 3) continue
    const idRaw = (r[iId] || '').trim()
    const model = (r[iModel] || '').trim(), wh = (r[iWH] || '').trim(), ph = (r[iPH] || '').trim(),
      sub = (r[iSub] || '').trim(), name = (r[iName] || '').trim()
    if (name) flaggedNames.push(`DB ${idRaw || '-'}: "${name}"`)
    if (!(model || wh || ph || sub)) continue
    const id = parseInt(idRaw, 10)
    if (!Number.isFinite(id)) { noId.push(`model=${model} wh=${wh} ph=${ph}`); continue }
    edits.set(id, { model, wh, ph, sub })
  }

  const payload = await boot()
  const prods = (await payload.find({ collection: 'products', limit: 2000, depth: 1, draft: true })).docs as any[]
  const bySrc = new Map<number, any>()
  for (const p of prods) for (const s of (p.legacySourceIds || [])) bySrc.set(Number(s), p)

  let nModel = 0, nWH = 0, nPH = 0, nSub = 0, unmatched = 0
  const catRenames = new Map<string, string>() // categoryDocId -> new name
  const updates = new Map<string, any>() // productId -> data

  for (const [id, e] of edits) {
    const p = bySrc.get(id)
    if (!p) { unmatched++; continue }
    const data = updates.get(p.id) || {}
    if (e.model) { data.modelNo = e.model; nModel++ }
    if (e.wh || e.ph) {
      const specs = JSON.parse(JSON.stringify(data.specifications || p.specifications || []))
      const setSpec = (label: string, val: string) => {
        const row = specs.find((s: any) => (s.label || '').toLowerCase() === label.toLowerCase())
        if (row) row.value = val; else specs.push({ section: 'General', label, value: val })
      }
      if (e.wh) { setSpec('Working Height', e.wh); nWH++ }
      if (e.ph) { setSpec('Platform Height', e.ph); nPH++ }
      data.specifications = specs
    }
    if (e.sub && p.category?.id) { catRenames.set(p.category.id, e.sub); nSub++ }
    updates.set(p.id, data)
  }

  console.log('=== CURATION PLAN ===')
  console.log(`model renames: ${nModel} | WH revisions: ${nWH} | PH revisions: ${nPH} | subcategory renames: ${nSub}`)
  console.log(`product docs to update: ${updates.size} | category renames: ${catRenames.size} | unmatched DB IDs: ${unmatched}`)
  console.log(`\nFLAGGED — NOT applied (review):`)
  console.log(`  "Rename" -> value (likely a regroup, not a rename): ${flaggedNames.length}`)
  flaggedNames.forEach((s) => console.log(`     ${s}`))
  console.log(`  rows with no DB ID: ${noId.length}`); noId.forEach((s) => console.log(`     ${s}`))

  if (!APPLY) { console.log('\nDRY RUN — no changes written. Re-run with APPLY=1.'); return }

  for (const [pid, data] of updates) await payload.update({ collection: 'products', id: pid, data, depth: 0 })
  for (const [cid, name] of catRenames) await payload.update({ collection: 'categories', id: cid, data: { name }, depth: 0 })
  console.log(`\nAPPLIED: ${updates.size} products, ${catRenames.size} categories renamed.`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
