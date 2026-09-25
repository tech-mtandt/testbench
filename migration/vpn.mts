import { boot } from './lib/payload.mjs'
async function main(){ const p:any=await boot()
  const d=(await p.find({collection:'products',where:{featuredImage:{exists:true}},limit:1,depth:1})).docs[0]
  console.log('product:', d?.title, '| slug:', d?.slug, '| image:', d?.featuredImage?.filename, '| content root children:', d?.content?.root?.children?.length)
  console.log('products:', (await p.count({collection:'products'})).totalDocs, '| media:', (await p.count({collection:'media'})).totalDocs)
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)})
