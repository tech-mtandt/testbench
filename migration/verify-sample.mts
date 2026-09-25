import { boot } from './lib/payload.mjs'
async function main() {
  const payload = await boot()
  const res = await payload.find({ collection: 'products', limit: 3, depth: 1, sort: '-legacyId' })
  for (const p of res.docs as any[]) {
    console.log('\n=== ', p.name, '| status:', p._status, '| slug:', p.slug)
    console.log('  availability:', p.availability, '| condition:', p.condition, '| legacySourceIds:', p.legacySourceIds)
    console.log('  category:', p.category?.name ?? p.category)
    console.log('  applications:', (p.applications||[]).map((a:any)=>a?.name??a))
    console.log('  industries:', (p.industries||[]).map((a:any)=>a?.title??a))
    console.log('  specs count:', (p.specifications||[]).length, '| first:', (p.specifications||[])[0])
    console.log('  shortDescription:', (p.shortDescription||'').slice(0,80))
  }
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
