# Live-site scrape → static content

Snapshot of www.mtandt.com used to rebuild pages whose content isn't in Payload yet.
Output lives in `src/content/scraped/*.json` (committed) and `public/legacy/**` (assets, ~600 MB — see below).

## Re-run
```
# 1. crawl (Playwright + system Chrome; throttled — live site rate-limits at ~4 req/s)
cd <scratch dir> && npm i playwright-core && CONC=2 MAX=450 node <repo>/migration/scrape/crawl.mjs
#    -> scrape/pages/<key>.{html,json,desktop.jpg}, scrape/index.json

# 2. extract (pip install beautifulsoup4 lxml; product facets also read local MySQL mtandt_local if running)
python migration/scrape/extract.py          <scratch>/scrape   # home
python migration/scrape/extract_products.py <scratch>/scrape   # categories, listings, product detail
python migration/scrape/extract_custom.py   <scratch>/scrape   # custom products, industries, case studies
python migration/scrape/extract_services.py <scratch>/scrape   # services, career, annual returns, legal
python migration/scrape/extract_media.py    <scratch>/scrape   # press, events, gallery, blog fallbacks
python migration/scrape/extract_company.py  <scratch>/scrape   # about, contact, catalogues, partner forms

# 3. assets: copies every /legacy/... path referenced in src/content + src/app into public/legacy
node migration/scrape/copy-assets.mjs       # source: ../website/public, else downloads from live

# 4. publish assets to Supabase Storage (media bucket, legacy/ prefix); re-runnable, skips unchanged
node --env-file=.env migration/scrape/upload-legacy.mjs
```

`public/legacy/` is gitignored. In production, `next.config.mjs` rewrites `/legacy/*` to the bucket
(derived from `S3_ENDPOINT` + `S3_BUCKET`, or set `LEGACY_ASSETS_BASE`); locally, files in
`public/legacy` are served first. Some Indian ISPs hijack DNS for `*.supabase.co`, so
`upload-legacy.mjs` resolves Supabase hosts via Cloudflare DNS-over-HTTPS.

`crawl.mjs` resumes from existing output; delete `scrape/pages` for a fresh crawl.

## Where each page's data comes from
| Area | Source |
|---|---|
| Blogs | Payload `blogs` (3 demo posts fall back to scraped body) |
| Services | Payload `services` titles/images + scraped body/sections (DB bodies are mostly junk JSON strings) |
| About | Payload `about` global + scraped principles/journey/accreditations/awards |
| Contact | Payload `contact` tables via raw read-only SQL (config drifted from DB) + scraped offices |
| Catalogues | Payload `catalogues` + scraped categories (guessed from titles) |
| Products, custom products, industries, case studies, press, events, gallery, home, nav, partner forms | Scrape only |
