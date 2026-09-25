/**
 * Batch D+G: pages (dynamicpages), joint-ventures, divisions, + About & SiteContent globals.
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-content-dg.mts
 */
import { boot, upsertByLegacyId } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { ensureMedia } from './lib/media.mjs'

async function main() {
  const payload = await boot()
  const db = await mysqlConn()
  const mc = new Map<string, string | null>()

  // ---- Pages ----
  const [pages] = (await db.query('SELECT * FROM dynamicpages')) as any; let n = 0
  for (const p of pages) {
    await upsertByLegacyId(payload, 'pages', p.id, {
      title: clean(p.title) ?? `Page ${p.id}`,
      slug: clean(p.slug) ?? `page-${p.id}`,
      contentHtml: p.content ? String(p.content) : undefined,
      meta: { title: clean(p.meta_title), description: clean(p.meta_dis), keywords: clean(p.meta_keyword), image: await ensureMedia(payload, p.meta_image, mc) },
    }); n++
  }
  console.log(`pages: ${n}`)

  // ---- Joint ventures ----
  const [jv] = (await db.query('SELECT * FROM joint_ventures')) as any; n = 0
  for (const j of jv) {
    await upsertByLegacyId(payload, 'joint-ventures', j.id, {
      name: clean(j.venture_name) ?? `JV ${j.id}`,
      websiteUrl: clean(j.website_url),
      logo: await ensureMedia(payload, j.image, mc),
      categoryType: j.category_type != null ? Number(j.category_type) : undefined,
    }); n++
  }
  console.log(`joint-ventures: ${n}`)

  // ---- Divisions ----
  const [dv] = (await db.query('SELECT * FROM divisions')) as any; n = 0
  for (const d of dv) {
    await upsertByLegacyId(payload, 'divisions', d.id, {
      heading: clean(d.heading) ?? `Division ${d.id}`,
      brand: clean(d.brand),
      descriptionHtml: d.description ? String(d.description) : undefined,
      image: await ensureMedia(payload, d.image, mc),
      logo: await ensureMedia(payload, d.logo, mc),
    }); n++
  }
  console.log(`divisions: ${n}`)

  // ---- About global (principles from groups, awards from awordimages) ----
  const [grp] = (await db.query('SELECT id,icon,iconTitle,iconDescription FROM `groups`')) as any
  const [aw] = (await db.query('SELECT id,image FROM awordimages')) as any
  const awards = []
  for (const a of aw) { const m = await ensureMedia(payload, a.image, mc); if (m) awards.push({ image: m }) }
  await payload.updateGlobal({ slug: 'about', data: {
    principles: grp.map((g: any) => ({ icon: clean(g.icon), title: clean(g.iconTitle), descriptionHtml: g.iconDescription ? String(g.iconDescription) : undefined })),
    awards,
  } })
  console.log(`about: ${grp.length} principles, ${awards.length} awards`)

  // ---- SiteContent global (headings key/value) ----
  const [hd] = (await db.query('SELECT `keys`,`values` FROM headings')) as any
  await payload.updateGlobal({ slug: 'site-content', data: {
    entries: hd.map((h: any) => ({ key: clean(h.keys), value: clean(h.values) })).filter((e: any) => e.key),
  } })
  console.log(`site-content: ${hd.length} entries`)

  await db.end()
  console.log('\nBatch D+G DONE.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
