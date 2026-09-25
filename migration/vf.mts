import { boot } from './lib/payload.mjs'
async function main(){ const p=await boot()
  const h=await p.findGlobal({slug:'header',depth:0}) as any
  console.log('header menu:', h.menu.map((m:any)=>`${m.label}(${m.children?.length||0})`).join(', '))
  const hp=await p.findGlobal({slug:'homepage',depth:1}) as any
  console.log('slide1:', hp.slides[0]?.heading, '| img:', hp.slides[0]?.image?.sourceName)
  console.log('featured1:', hp.featured[0]?.name, '| img:', hp.featured[0]?.image?.sourceName)
  const ci=await p.findGlobal({slug:'contact-info',depth:0}) as any
  console.log('contact phone:', ci.phone, '| offices:', ci.offices.length, '| office1:', ci.offices[0]?.branchName)
  console.log('products still:', (await p.count({collection:'products'})).totalDocs, '| events:', (await p.count({collection:'events'})).totalDocs)
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)})
