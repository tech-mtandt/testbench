import { boot } from './lib/payload.mjs'
async function main(){
  const payload = await boot()
  const db:any = payload.db
  console.log('running migrate()...')
  await db.migrate()
  console.log('migrate() done — status:')
  await db.migrateStatus()
}
main().then(()=>process.exit(0)).catch(e=>{console.error('ERR',e.message);process.exit(1)})
