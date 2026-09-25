// BFS crawl of www.mtandt.com: screenshots + rendered HTML + structured content JSON.
import { chromium } from 'playwright-core'
import fs from 'fs'
import path from 'path'

const OUT = path.resolve('scrape/pages')
fs.mkdirSync(OUT, { recursive: true })
const ORIGIN = 'https://www.mtandt.com'
const MAX = Number(process.env.MAX || 400)
const CONC = Number(process.env.CONC || 4)
const SKIP = /\/(forntend|imageFile|webmail|storage|public)\/|\.(pdf|jpe?g|png|webp|gif|zip|css|js|svg|mp4)$|\/compare$|^\/?$/i

const norm = (u) => {
  try {
    const x = new URL(u.trim(), ORIGIN)
    if (x.hostname !== 'www.mtandt.com' && x.hostname !== 'mtandt.com') return null
    x.hash = ''; x.search = ''
    let p = decodeURI(x.pathname).replace(/\/+$/, '').replace(/\s+$/, '')
    return p || '/'
  } catch { return null }
}
const fileKey = (p) => (p === '/' ? 'home' : p.slice(1).replace(/[^a-z0-9]+/gi, '_')).slice(0, 150)

const seeds = ['/', '/about-us', '/contact-us', '/career', '/catalogues', '/media', '/media/events', '/media/gallery', '/media/press', '/blogs', '/customers', '/dealer', '/vendors', '/annual-returns', '/pages/privacy-policy', '/pages/term-conditions', '/services', '/industries', '/casestudy', '/joint-venture', '/compare']
const queue = [...seeds]
const seen = new Set(queue)
const index = []
let blogCount = 0
const allowBlog = (q) => !q.startsWith('/blogs/') || (blogCount++ < 6)
for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(`${OUT}/${f}`, 'utf8'))
  if (d.status !== 200 && d.status !== 404) continue
  seen.add(d.path); index.push({ path: d.path, finalPath: d.finalPath, status: d.status, key: f.replace('.json', ''), title: d.meta?.title, blocks: d.blocks?.length })
}
for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(`${OUT}/${f}`, 'utf8'))
  for (const l of d.links || []) { const q = norm(l); if (q && !seen.has(q) && !SKIP.test(q) && allowBlog(q)) { seen.add(q); queue.push(q) } }
}
const done = new Set(index.map((i) => i.path))
for (let i = queue.length - 1; i >= 0; i--) if (done.has(queue[i])) queue.splice(i, 1)
console.log('resume: done', index.length, 'queued', queue.length)

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36' })
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' })

async function extract(page) {
  return page.evaluate(() => {
    const vis = (el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' }
    const header = document.querySelector('header')
    const footer = document.querySelector('footer')
    const inChrome = (el) => (header && header.contains(el)) || (footer && footer.contains(el))
    const blocks = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
    const TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'IMG', 'A', 'BUTTON', 'TD', 'TH', 'IFRAME', 'VIDEO', 'BLOCKQUOTE', 'FORM', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'])
    let n
    while ((n = walker.nextNode())) {
      if (!TAGS.has(n.tagName) || inChrome(n)) continue
      if (n.closest('script,style,noscript')) continue
      const t = n.tagName
      if (t === 'IMG') { const src = n.currentSrc || n.src || n.getAttribute('data-src'); if (src) blocks.push({ t, src, alt: n.alt || '' }); continue }
      if (t === 'IFRAME' || t === 'VIDEO') { blocks.push({ t, src: n.src || n.querySelector('source')?.src }); continue }
      if (t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA') { blocks.push({ t, name: n.name, type: n.type, placeholder: n.placeholder || '', required: n.required }); continue }
      if (t === 'FORM') { blocks.push({ t, action: n.action, method: n.method, id: n.id }); continue }
      if (t === 'A') { if (n.querySelector('h1,h2,h3,h4,h5,h6,p,img')) { blocks.push({ t, href: n.href, text: '' }); continue } }
      const text = n.innerText?.replace(/\s+/g, ' ').trim()
      if (!text) continue
      if (t === 'P' && n.closest('li,td,th')) continue
      blocks.push({ t, text, ...(t === 'A' ? { href: n.href } : {}), hidden: !vis(n) || undefined })
    }
    // background images (heroes/sliders are often CSS backgrounds)
    const bgs = new Set()
    document.querySelectorAll('*').forEach((el) => { const b = getComputedStyle(el).backgroundImage; if (b && b.startsWith('url(')) bgs.add(b.slice(5, -2)) })
    const meta = {
      title: document.title,
      description: document.querySelector('meta[name=description]')?.content || '',
      keywords: document.querySelector('meta[name=keywords]')?.content || '',
      canonical: document.querySelector('link[rel=canonical]')?.href || '',
      ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent.trim()).slice(0, 5),
    }
    const links = [...document.querySelectorAll('a[href]')].map((a) => a.href)
    const imgs = [...document.images].map((i) => i.currentSrc || i.src).filter(Boolean)
    return { meta, blocks, bgs: [...bgs], links, imgs, height: document.body.scrollHeight }
  })
}

async function visit(p, attempt = 0) {
  const key = fileKey(p)
  const url = ORIGIN + (p === '/' ? '/' : encodeURI(p))
  const page = await ctx.newPage()
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
    const status = res?.status() ?? 0
    if ((status === 429 || status >= 500) && attempt < 4) { await page.close().catch(() => {}); console.log(`retry ${status} ${p} in ${20 * (attempt + 1)}s`); await new Promise((r) => setTimeout(r, 20000 * (attempt + 1))); return visit(p, attempt + 1) }
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
    // trigger lazy loading
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } window.scrollTo(0, 0) })
    await page.waitForTimeout(800)
    const finalPath = norm(page.url())
    const data = await extract(page)
    fs.writeFileSync(`${OUT}/${key}.json`, JSON.stringify({ path: p, finalPath, status, ...data }, null, 1))
    fs.writeFileSync(`${OUT}/${key}.html`, await page.content())
    await page.screenshot({ path: `${OUT}/${key}.desktop.jpg`, fullPage: true, type: 'jpeg', quality: 60 }).catch(() => {})
    index.push({ path: p, finalPath, status, key, title: data.meta.title, blocks: data.blocks.length })
    for (const l of data.links) { const q = norm(l); if (q && !seen.has(q) && !SKIP.test(q) && seen.size < MAX && allowBlog(q)) { seen.add(q); queue.push(q) } }
    fs.writeFileSync('scrape/index.json', JSON.stringify(index, null, 1))
    await new Promise((r) => setTimeout(r, 2500))
    console.log(`[${index.length}/${seen.size}] ${status} ${p} (${data.blocks.length} blocks)`)
  } catch (e) {
    index.push({ path: p, error: String(e).slice(0, 200), key })
    console.log(`ERR ${p} ${String(e).slice(0, 120)}`)
  } finally { await page.close().catch(() => {}) }
}

async function mobileShot(p) {
  const page = await mctx.newPage()
  try {
    await page.goto(ORIGIN + encodeURI(p), { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    await page.screenshot({ path: `${OUT}/${fileKey(p)}.mobile.jpg`, fullPage: true, type: 'jpeg', quality: 55 })
  } catch {} finally { await page.close() }
}

async function worker() { while (queue.length) { const p = queue.shift(); await visit(p) } }
await Promise.all(Array.from({ length: CONC }, worker))
// mobile screenshots for one of each template
const templates = ['/', '/about-us', '/contact-us', '/catalogues', '/media', '/career', '/services/amc', '/category-by-subcategory/aerial-work-platform', '/product-category-buy/aerial-work-platform/scissor-lift', '/custom-product-detail-buy/temporary-road-mats/porta-deck']
const pd = index.find((i) => i.path.startsWith('/product-detail'))
if (pd) templates.push(pd.path)
for (const t of templates) await mobileShot(t)
fs.writeFileSync('scrape/index.json', JSON.stringify(index, null, 1))
await browser.close()
console.log('DONE', index.length)
