import { boot } from './lib/payload.mjs'
async function main(){ const p=await boot()
  const b=(await p.find({collection:'blogs',limit:1,depth:1,where:{coverImage:{exists:true}}})).docs[0] as any
  console.log('blog:', b?.title, '| cover:', b?.coverImage?.sourceName, '| tags:', (b?.tags||[]).length, '| date:', b?.publishedDate)
  const s=(await p.find({collection:'services',limit:1,depth:1,where:{image:{exists:true}}})).docs[0] as any
  console.log('service:', s?.title, '| image:', s?.image?.sourceName, '| icons:', (s?.icons||[]).map((i:any)=>i.icon))
  const t=(await p.find({collection:'team',limit:1,depth:1,where:{photo:{exists:true}}})).docs[0] as any
  console.log('team:', t?.name, t?.post, '| photo:', t?.photo?.sourceName)
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)})
