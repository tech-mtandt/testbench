import { boot } from './lib/payload.mjs'
import { readdirSync } from 'fs'
import path from 'path'
async function main(){
  const p = await boot()
  const dir = 'd:/LeverageAxioms/mtandt/website/public/imageFile'
  const files = readdirSync(dir).filter(f=>/\.(jpg|jpeg|png|webp|gif)$/i.test(f))
  console.log('imageFile dir has', files.length, 'images; test-uploading one:', files[0])
  const doc = await p.create({ collection:'media', data:{ alt: 'S3 connection test' }, filePath: path.join(dir, files[0]) })
  console.log('UPLOAD OK -> media id', doc.id, '| url:', doc.url)
  console.log('cleaning up test doc...'); await p.delete({ collection:'media', id: doc.id })
  console.log('DONE — S3 connection works.')
}
main().then(()=>process.exit(0)).catch(e=>{console.error('S3 TEST FAILED:', e.message); process.exit(1)})
