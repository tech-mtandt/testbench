import { boot } from './lib/payload.mjs'
async function main(){ const p=await boot()
  for(const c of ['products','blogs','events','press','gallery','catalogues']) console.log(c, (await p.count({collection:c as any})).totalDocs)
  const gImg=(await p.count({collection:'gallery',where:{mediaType:{equals:'image'}}})).totalDocs
  const gVid=(await p.count({collection:'gallery',where:{mediaType:{equals:'video'}}})).totalDocs
  console.log('gallery split -> image:',gImg,'video:',gVid)
  const cat=(await p.find({collection:'catalogues',limit:1,depth:1,where:{file:{exists:true}}})).docs[0] as any
  console.log('catalogue sample:', cat?.name, '| cover:', cat?.coverImage?.sourceName, '| pdf:', cat?.file?.sourceName)
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)})
