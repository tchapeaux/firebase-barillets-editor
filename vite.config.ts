import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo-zebra.png'],
      manifest: {
        name: 'Editeur de barillets',
        short_name: 'Mes Barillets',
        description: "Éditeur de barillets d'improvisation théâtrale",
        theme_color: '#1087d9',
        background_color: '#fffac9',
        display: 'standalone',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // Precache app shell and static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Runtime caching strategies
        runtimeCaching: [
          {
            // Cache static assets (Vite-generated bundles with hash)
            urlPattern:
              /^https:\/\/.*\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Network-first for Firestore (with offline fallback)
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-data',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
          {
            // Network-only for Firebase Auth (never cache)
            urlPattern:
              /^https:\/\/(securetoken|identitytoolkit|accounts)\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
        ],

        // Clean up old caches
        cleanupOutdatedCaches: true,

        // Skip waiting for service worker activation
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true, // Enable PWA in development mode
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into its own chunk for better caching (~500 kB)
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Split Vue ecosystem
          'vue-vendor': ['vue', 'vue-router'],
          // Split UI library
          'ui-vendor': ['radix-vue', 'lucide-vue-next'],
        },
      },
    },
  },
});
