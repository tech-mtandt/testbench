import { boot } from './lib/payload.mjs'
async function main(){
  const p = await boot()
  const r = await p.find({ collection:'products', where:{ and:[{kind:{equals:'standard'}},{_status:{equals:'published'}},{mainImage:{exists:true}}] }, limit:3, depth:1 })
  console.log('published standard w/ mainImage:', (await p.count({collection:'products', where:{ and:[{_status:{equals:'published'}},{mainImage:{exists:true}}]}})).totalDocs)
  for(const d of r.docs as any[]){
    console.log(`\n${d.name}`)
    console.log('  mainImage:', d.mainImage?.sourceName, '->', d.mainImage?.url)
    console.log('  gallery:', (d.gallery||[]).length, 'imgs | banner:', d.bannerImage?.sourceName||'-', '| catalogue:', d.catalogue?.sourceName||'-')
  }
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
