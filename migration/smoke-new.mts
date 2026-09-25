import { boot } from './lib/payload.mjs'
async function main(){
  const p = await boot()
  const slugs = p.config.collections.map((c:any)=>c.slug).filter((s:string)=>!s.startsWith('payload-'))
  console.log('booted. collections:', slugs.join(', '))
  for(const s of ['products','catalogues','documents','brands','media']) console.log('  ', s, (await p.count({collection:s as any})).totalDocs)
}
main().then(()=>process.exit(0)).catch(e=>{console.error('BOOT ERR:', e.message);process.exit(1)})
