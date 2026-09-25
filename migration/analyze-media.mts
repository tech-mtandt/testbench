import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { existsSync } from 'fs'
import path from 'path'
const DIR = 'd:/LeverageAxioms/mtandt/website/public/imageFile'
async function main(){
  const payload = await boot()   // also pushes the sourceName schema change
  const db = await mysqlConn()
  const pub = await payload.find({ collection:'products', where:{ _status:{equals:'published'} }, limit:1000, depth:0 })
  const srcIds = new Set<number>()
  for(const p of pub.docs as any[]) (p.legacySourceIds||[]).forEach((i:number)=>srcIds.add(Number(i)))
  const ids = [...srcIds]
  if(!ids.length){ console.log('no published products'); process.exit(0) }
  const [prods] = await db.query(`SELECT id,image,bannerImage,catalogs FROM products WHERE id IN (${ids.join(',')})`) as any
  const [imgs] = await db.query(`SELECT productid,image FROM productimages WHERE productid IN (${ids.join(',')})`) as any
  const files = new Set<string>()
  for(const r of prods){ [clean(r.image),clean(r.bannerImage)].forEach(f=>{ if(f && f!=='[]') files.add(f) }) }
  for(const r of imgs){ const f=clean(r.image); if(f) files.add(f) }
  let onDisk=0, missing:string[]=[]
  for(const f of files){ if(existsSync(path.join(DIR,f))) onDisk++; else missing.push(f) }
  console.log(`published products: ${pub.docs.length} (${ids.length} legacy source ids)`)
  console.log(`unique image files referenced: ${files.size}`)
  console.log(`  on disk: ${onDisk} | missing: ${missing.length}`)
  if(missing.length) console.log('  first missing:', missing.slice(0,8))
  await db.end()
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
