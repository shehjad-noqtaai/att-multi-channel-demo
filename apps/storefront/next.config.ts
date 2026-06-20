import path from 'node:path'
import type {NextConfig} from 'next'

const studioSrc = path.resolve(__dirname, '../../studio/src')

const nextConfig: NextConfig = {
  // @studio/* must resolve to ../../studio/src. `transpilePackages` only
  // targets node_modules so we wire the alias into webpack AND turbopack.
  // Validated in production build (the storefront scaffold gate).
  webpack(config) {
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@studio': studioSrc,
    }
    return config
  },
  turbopack: {
    resolveAlias: {
      '@studio': studioSrc,
    },
  },
}

export default nextConfig
