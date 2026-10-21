import { readFileSync } from 'node:fs'
import { withPayload } from '@payloadcms/next/withPayload'

// Pages that moved to the group's brand websites (TsaF, AQ Access, Comet Bharat): one 301 hop
// from every address the page has had, so search engines pass its ranking on.
const brandRedirects = JSON.parse(readFileSync(new URL('./src/content/brand-redirects.json', import.meta.url), 'utf8'))
const toBrandSites = [
  ...brandRedirects.redirects.flatMap((r) =>
    [r.from, ...(r.also ?? [])].map((source) => ({ source, destination: r.to, statusCode: 301 })),
  ),
  // Any other address in a moved section (e.g. a product added later) goes to the brand's overview.
  ...brandRedirects.sections.map((s) => ({ source: `${s.prefix}/:path*`, destination: s.to, statusCode: 301 })),
]

// Scraped legacy assets live in Supabase Storage (media bucket, legacy/ prefix; see
// migration/scrape/upload-legacy.mjs). Local public/legacy files win when present.
const legacyAssetsBase =
  process.env.LEGACY_ASSETS_BASE ||
  (process.env.S3_ENDPOINT && process.env.S3_BUCKET
    ? `https://${new URL(process.env.S3_ENDPOINT).hostname.split('.')[0]}.supabase.co/storage/v1/object/public/${process.env.S3_BUCKET}/legacy`
    : null)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The old Laravel site served its uploads from the web root; keep those links (shared PDFs,
  // image search results) working after the domain moves here.
  async redirects() {
    return [
      ...['imageFile', 'forntend', 'service_brochure'].map((dir) => ({
        source: `/${dir}/:path*`,
        destination: `/legacy/${dir}/:path*`,
        permanent: true,
      })),
      { source: '/joint-ventures', destination: '/about-us#bussiness-unit', permanent: true },
      { source: '/public/services/:slug', destination: '/services/:slug', permanent: true },
      { source: '/media/news', destination: '/media/events', permanent: true },
      { source: '/annual-returns', destination: '/investor-relations', permanent: true },
      ...toBrandSites,
    ]
  },
  async rewrites() {
    if (!legacyAssetsBase) return []
    return [
      { source: '/legacy/:path*', destination: `${legacyAssetsBase}/:path*` },
      // responsive WebP variants (migration/scrape/optimize-images.mjs), stored alongside
      { source: '/legacy-opt/:path*', destination: `${legacyAssetsBase}-opt/:path*` },
    ]
  },
  // Cap build workers: each opens its own DB pool while prerendering.
  experimental: {
    cpus: 4,
    // Career CVs and partner documents are posted to the form server action (default limit
    // 1 MB). Vercel caps request bodies at 4.5 MB; the forms check sizes before sending.
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
