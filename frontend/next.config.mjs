import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      {
        // ==========================================
        // Zero-Trust Mutational Caching Override
        // ==========================================
        // Force STRICT NetworkOnly for the attendance scan mutation.
        // This completely overrides the default offline-first PWA caching strategy.
        // Attendance scans MUST hit the live database to verify cryptographic payload freshness 
        // and cannot be queued/spoofed in a Service Worker background sync.
        urlPattern: /\/api\/v1\/attendance\/scan/,
        handler: 'NetworkOnly',
        method: 'POST'
      },
      {
        // Standard caching strategy for UI assets
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offline-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      }
    ]
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
};

export default withPWA(nextConfig);
