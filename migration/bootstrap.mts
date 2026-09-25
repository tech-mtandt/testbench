/**
 * Boots Payload via the Local API (schema push + shared ETL harness).
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/bootstrap.mts
 */
export async function boot() {
  const { getPayload } = await import('payload')
  const config = (await import('../src/payload.config')).default
  const resolved: any = await config
  if (!resolved.secret) resolved.secret = process.env.PAYLOAD_SECRET // guard against @next/env reset
  return getPayload({ config: resolved })
}

async function main() {
  console.log('secret present before boot:', !!process.env.PAYLOAD_SECRET)
  const payload = await boot()
  const slugs = payload.config.collections.map((c: any) => c.slug)
  console.log('Payload booted. Collections:', slugs.join(', '))
  for (const slug of ['categories', 'brands', 'applications', 'industries', 'products', 'media']) {
    const { totalDocs } = await payload.count({ collection: slug as any })
    console.log(`  ${slug}: ${totalDocs} docs`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
