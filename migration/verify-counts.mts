import { boot } from './lib/payload.mjs'
async function main(){
  const p = await boot()
  const q = async (kind:string,status:string)=> (await p.count({collection:'products', where:{ and:[{kind:{equals:kind}},{_status:{equals:status}}] }})).totalDocs
  for(const k of ['standard','custom']) console.log(`${k}: published=${await q(k,'published')} draft=${await q(k,'draft')}`)
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
