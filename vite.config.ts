import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
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
