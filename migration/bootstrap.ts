/**
 * Boots Payload via the Local API. On init the postgres adapter pushes the
 * schema to the connected database (dev/push mode), creating tables for any
 * new collections. Also the shared harness for the media + product ETL.
 *
 * Run:  node --env-file=.env --import tsx migration/bootstrap.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

export async function boot() {
  return getPayload({ config })
}

async function main() {
  const payload = await boot()
  const slugs = payload.config.collections.map((c) => c.slug)
  console.log('Payload booted. Collections:', slugs.join(', '))
  for (const slug of ['categories', 'brands', 'applications', 'industries', 'products', 'media']) {
    try {
      const { totalDocs } = await payload.count({ collection: slug as any })
      console.log(`  ${slug}: ${totalDocs} docs`)
    } catch (e) {
      console.log(`  ${slug}: ERROR ${(e as Error).message}`)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
