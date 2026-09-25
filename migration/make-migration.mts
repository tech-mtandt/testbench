import { boot } from './lib/payload.mjs'
async function main(){
  const payload = await boot()
  const name = process.env.MIG_NAME || 'auto'
  const db:any = payload.db
  console.log('adapter methods:', ['createMigration','migrate','migrateStatus'].filter(m=>typeof db[m]==='function').join(', '))
  await db.createMigration({ migrationName: name, payload, forceAcceptWarning: true })
  console.log('createMigration returned')
}
main().then(()=>process.exit(0)).catch(e=>{console.error('ERR', e.message); process.exit(1)})
