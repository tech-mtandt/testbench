import { boot } from './lib/payload.mjs'
import sharp from 'sharp'
import path from 'path'
import os from 'os'
const DIR = 'd:/LeverageAxioms/mtandt/website/public/imageFile'
const TIFS = ['17332069970bannerImage.tif','17332072430bannerImage.tif']
async function main(){
  const payload = await boot()
  for(const tif of TIFS){
    const src = path.join(DIR, tif)
    const outName = tif.replace(/\.tif$/i,'.webp')
    const out = path.join(os.tmpdir(), outName)
    const info = await sharp(src, { limitInputPixels: false, unlimited: true, failOn: 'none' }).resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out)
    console.log(`converted ${tif} -> ${outName} (${Math.round(info.size/1024)} KB, ${info.width}x${info.height})`)
    // idempotent: skip if a Media already has this sourceName
    const existing = await payload.find({ collection:'media', where:{ sourceName:{ equals: tif } }, limit:1, depth:0 })
    if(existing.docs.length){ console.log('  already in Media, skipping upload'); continue }
    const doc = await payload.create({ collection:'media', data:{ sourceName: tif, alt: outName }, filePath: out, depth:0 })
    console.log('  uploaded -> media id', doc.id, doc.url)
  }
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
