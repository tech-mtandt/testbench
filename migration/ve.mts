import { boot } from './lib/payload.mjs'
async function main(){ const p=await boot()
  const f=(await p.find({collection:'products',where:{features:{exists:true}},limit:1,depth:0})).docs[0] as any
  console.log('product w/ features:', f?.name, '| faqs:', (f?.faqs||[]).length, '| features len:', (f?.features||'').length)
  const cj=(await p.find({collection:'products',where:{and:[{kind:{equals:'custom'}},{customerJourney:{exists:true}}]},limit:1,depth:0})).docs[0] as any
  console.log('custom w/ journey:', cj?.name, '| journey steps:', (cj?.customerJourney||[]).length, '| clientLogos:', (cj?.clientLogos||[]).length)
  const c=(await p.find({collection:'categories',where:{faqs:{exists:true}},limit:1,depth:0})).docs[0] as any
  console.log('category w/ faqs:', c?.name, '| faqs:', (c?.faqs||[]).length, '| q1:', c?.faqs?.[0]?.question)
  console.log('products:',(await p.count({collection:'products'})).totalDocs,'categories:',(await p.count({collection:'categories'})).totalDocs)
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)})
