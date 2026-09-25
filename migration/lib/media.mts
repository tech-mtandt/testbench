import { existsSync } from 'fs'
import path from 'path'

export const IMG_DIR = 'd:/LeverageAxioms/mtandt/website/public/imageFile'

/** Normalise a legacy image column: JSON-array -> first, strip imageFile/ prefix, trim. */
export function cleanFilename(v: unknown): string | null {
  let s = String(v ?? '').trim()
  if (!s || s === 'null' || s === '[]') return null
  if (s.startsWith('[')) {
    try { const a = JSON.parse(s); s = Array.isArray(a) && a.length ? String(a[0]) : '' } catch {}
  }
  s = s.replace(/^imageFile\//i, '').trim()
  return s || null
}

/**
 * Ensure a legacy file is in Media (idempotent by sourceName) and return its id.
 * Returns null if the value is empty or the file isn't on disk. Pass a Map cache
 * to dedupe within a run.
 */
export async function ensureMedia(payload: any, raw: unknown, cache?: Map<string, string | null>): Promise<string | null> {
  const f = cleanFilename(raw)
  if (!f) return null
  if (cache?.has(f)) return cache.get(f) ?? null
  try {
    // redesign Media has no sourceName field — dedup by Payload's built-in filename
    const existing = await payload.find({ collection: 'media', where: { filename: { equals: f } }, limit: 1, depth: 0 })
    if (existing.docs.length) { cache?.set(f, existing.docs[0].id); return existing.docs[0].id }
    if (!existsSync(path.join(IMG_DIR, f))) { cache?.set(f, null); return null }
    const d = await payload.create({ collection: 'media', data: { alt: f }, filePath: path.join(IMG_DIR, f), depth: 0 })
    cache?.set(f, d.id); return d.id
  } catch (e) {
    console.log(`  media skip "${f}": ${(e as Error).message.split('\n')[0]}`)
    cache?.set(f, null); return null
  }
}
