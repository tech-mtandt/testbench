/**
 * Batch F: populate site globals from chrome tables.
 *   header <- headermenus (2-level tree, junk filtered)
 *   footer <- footerlinks + footerproduct
 *   social <- socialicons
 *   homepage <- sliderimage (hero) + frontproducts (featured)
 *   contact-info <- contacts + whatsapps + address (offices) + contactaddres (regions)
 *
 * Run: node --require ./migration/patch-next-env.cjs --env-file=.env --import tsx migration/import-globals.mts
 */
import { boot } from './lib/payload.mjs'
import { mysqlConn, clean } from './lib/mysql.mjs'
import { ensureMedia } from './lib/media.mjs'

const stripHtml = (s?: string) => (s ? s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : undefined)
const goodLabel = (s: unknown) => { const n = clean(s); return n && n.length > 1 && /[A-Z]/.test(n) ? n : null } // filters junk menu names
const phonesFrom = (v: unknown) => { const s = clean(v); if (!s) return undefined; try { const a = JSON.parse(s); return Array.isArray(a) ? a.filter(Boolean).join(', ') : s } catch { return s } }

async function main() {
  const payload = await boot()
  const db = await mysqlConn()
  const mc = new Map<string, string | null>()

  // ---- Header (2-level tree) ----
  const [hm] = (await db.query('SELECT id,mainMenu,menuName,menuUrl,slug FROM headermenus WHERE is_visible=1')) as any
  const childrenOf = (parentId: number) => hm.filter((r: any) => Number(r.mainMenu) === parentId && goodLabel(r.menuName))
    .map((r: any) => ({ label: goodLabel(r.menuName), url: clean(r.menuUrl), slug: clean(r.slug) }))
  const menu = hm.filter((r: any) => Number(r.mainMenu) === 0 && goodLabel(r.menuName))
    .map((r: any) => ({ label: goodLabel(r.menuName), url: clean(r.menuUrl), slug: clean(r.slug), children: childrenOf(Number(r.id)) }))
  await payload.updateGlobal({ slug: 'header', data: { menu } })
  console.log(`header: ${menu.length} top-level items`)

  // ---- Footer ----
  const [fl] = (await db.query('SELECT linkName,linkUrl FROM footerlinks')) as any
  const [fp] = (await db.query('SELECT productName,productUrl FROM footerproduct')) as any
  await payload.updateGlobal({ slug: 'footer', data: {
    links: fl.map((r: any) => ({ label: clean(r.linkName), url: clean(r.linkUrl) })),
    productLinks: fp.map((r: any) => ({ label: clean(r.productName), url: clean(r.productUrl) })),
  } })
  console.log(`footer: ${fl.length} links, ${fp.length} product links`)

  // ---- Social ----
  const [si] = (await db.query('SELECT socialIcon,socialUrl FROM socialicons')) as any
  await payload.updateGlobal({ slug: 'social', data: {
    links: si.map((r: any) => ({ platform: (clean(r.socialIcon) || '').replace(/^fa fa-/, ''), icon: clean(r.socialIcon), url: clean(r.socialUrl) })),
  } })
  console.log(`social: ${si.length} links`)

  // ---- Homepage ----
  const [sl] = (await db.query('SELECT * FROM sliderimage ORDER BY sort_order')) as any
  const slides = []
  for (const s of sl) slides.push({ image: await ensureMedia(payload, s.image, mc), heading: clean(s.heading), subheading: stripHtml(clean(s.headingone)), buttonLabel: clean(s.button), buttonUrl: clean(s.buttonUrl) })
  const [frp] = (await db.query('SELECT name,image,url FROM frontproducts')) as any
  const featured = []
  for (const f of frp) featured.push({ name: clean(f.name), image: await ensureMedia(payload, f.image, mc), url: clean(f.url) })
  await payload.updateGlobal({ slug: 'homepage', data: { slides, featured } })
  console.log(`homepage: ${slides.length} slides, ${featured.length} featured`)

  // ---- Contact info ----
  const [[ct]] = (await db.query('SELECT mobileNumber,email FROM contacts LIMIT 1')) as any
  const [[wa]] = (await db.query('SELECT whatsappNo FROM whatsapps LIMIT 1')) as any
  const [addr] = (await db.query('SELECT * FROM address')) as any
  const [ca] = (await db.query('SELECT name FROM contactaddres')) as any
  await payload.updateGlobal({ slug: 'contact-info', data: {
    phone: clean(ct?.mobileNumber), email: clean(ct?.email), whatsapp: clean(wa?.whatsappNo),
    offices: addr.map((a: any) => ({ companyName: clean(a.compnyName), branchName: clean(a.branchName), address: clean(a.address), phones: phonesFrom(a.mobileNum), email: clean(a.email), mapUrl: clean(a.mapUrl) })),
    regions: ca.map((r: any) => ({ name: clean(r.name) })).filter((r: any) => r.name),
  } })
  console.log(`contact-info: ${addr.length} offices, ${ca.length} regions`)

  await db.end()
  console.log('\nBatch F DONE.')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
