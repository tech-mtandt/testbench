/** Boots Payload via the Local API. Shared by all ETL scripts. */
export async function boot() {
  const { getPayload } = await import('payload')
  const config = (await import('../../src/payload.config')).default
  const resolved: any = await config
  if (!resolved.secret) resolved.secret = process.env.PAYLOAD_SECRET // guard against @next/env reset
  return getPayload({ config: resolved })
}

/** Upsert a doc keyed by its legacy MySQL id, so ETL scripts are idempotent. */
export async function upsertByLegacyId(
  payload: any,
  collection: string,
  legacyId: number,
  data: Record<string, unknown>,
) {
  const existing = await payload.find({
    collection,
    where: { legacyId: { equals: legacyId } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length) {
    return payload.update({ collection, id: existing.docs[0].id, data, depth: 0 })
  }
  return payload.create({ collection, data: { ...data, legacyId }, depth: 0 })
}
