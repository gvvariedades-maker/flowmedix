/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@react-email/components', '@react-email/render', 'resend'],
  experimental: {
    // Tree-shaking agressivo de libs com muitos exports — reduz JS no mobile/4G.
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-tabs'],
  },
  async redirects() {
    return [
      { source: '/campina-grande', destination: '/lp/campina-grande', permanent: true },
      { source: '/simulados/campina', destination: '/simulados/campina-grande', permanent: false },
      { source: '/goianinha', destination: '/lp/goianinha', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              // *.sentry.io liberado para o ingest do Sentry quando NEXT_PUBLIC_SENTRY_DSN estiver ativo.
              "connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io",
            ].join('; ')
          },
        ],
      },
    ];
  },
}

// Sentry: só embrulha a config quando há DSN. Sem DSN, exporta a config crua —
// build e dev local passam sem nenhuma variável Sentry. Upload de source maps
// só ocorre com SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT (CI).
const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (!sentryDsn) {
  module.exports = nextConfig
} else {
  const { withSentryConfig } = require('@sentry/nextjs')

  module.exports = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    // Só loga upload de source maps em CI.
    silent: !process.env.CI,
    // Encaminha eventos do browser por uma rota same-origin (evita ad blockers).
    tunnelRoute: '/monitoring',
    // Sem token de upload, não tente subir source maps (build local não quebra).
    sourcemaps: {
      disable: !process.env.SENTRY_AUTH_TOKEN,
    },
    webpack: {
      // Tree-shake de statements de log do Sentry.
      treeshake: {
        removeDebugLogging: true,
      },
    },
  })
}

