import { boot } from './lib/payload.mjs'
async function main(){ const p:any=await boot()
  for(const c of ['products','catalogues','documents','media']) console.log(c.padEnd(12), (await p.count({collection:c as any})).totalDocs)
  const cat=(await p.find({collection:'catalogues',limit:1,depth:1})).docs[0]
  console.log('\ncatalogue sample:', cat?.title)
  console.log('  poster:', cat?.poster?.filename, '| document:', cat?.document?.filename)
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)})
