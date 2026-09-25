/**
 * Sheet intent: the 8 "Equipment & Tools" rows are a REGROUP, not a rename.
 * Create a new top-level "Equipment & Tools" category and move the affected
 * custom products (PortaDeck, PortaMat, PortaPad, WEB Deck/Net/Catch) into it.
 * Legacy coustomeproducts ids from the sheet: 1,31,8,16,9,18,15,21 (merge -> 6 products).
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/apply-equipment-category.mts
 */
import { boot } from './lib/payload.mjs'

const LEGACY_IDS = new Set([1, 31, 8, 16, 9, 18, 15, 21])

async function main() {
  const payload = await boot()

  // find-or-create the category
  const found = await payload.find({ collection: 'categories', where: { slug: { equals: 'equipment-and-tools' } }, limit: 1, depth: 0 })
  const cat = found.docs[0] ?? (await payload.create({
    collection: 'categories',
    data: { name: 'Equipment & Tools', slug: 'equipment-and-tools', productKind: 'cp' },
    depth: 0,
  }))
  console.log(`category "Equipment & Tools" -> id ${cat.id} (${found.docs.length ? 'existing' : 'created'})`)

  // find the affected custom products by legacy source id
  const customs = (await payload.find({ collection: 'products', where: { kind: { equals: 'custom' } }, limit: 1000, depth: 0, draft: true })).docs as any[]
  const targets = customs.filter((p) => (p.legacySourceIds || []).some((s: number) => LEGACY_IDS.has(Number(s))))

  for (const p of targets) {
    await payload.update({ collection: 'products', id: p.id, data: { category: cat.id }, depth: 0 })
    console.log(`  moved: ${p.name} (${p._status}) [src ${JSON.stringify(p.legacySourceIds)}]`)
  }
  console.log(`\nDONE: ${targets.length} products moved to "Equipment & Tools".`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
