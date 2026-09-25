import { withPayload } from '@payloadcms/next/withPayload'

// Scraped legacy assets live in Supabase Storage (media bucket, legacy/ prefix; see
// migration/scrape/upload-legacy.mjs). Local public/legacy files win when present.
const legacyAssetsBase =
  process.env.LEGACY_ASSETS_BASE ||
  (process.env.S3_ENDPOINT && process.env.S3_BUCKET
    ? `https://${new URL(process.env.S3_ENDPOINT).hostname.split('.')[0]}.supabase.co/storage/v1/object/public/${process.env.S3_BUCKET}/legacy`
    : null)

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return legacyAssetsBase ? [{ source: '/legacy/:path*', destination: `${legacyAssetsBase}/:path*` }] : []
  },
  // Cap build workers: each opens its own DB pool while prerendering.
  experimental: {
    cpus: 4,
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
