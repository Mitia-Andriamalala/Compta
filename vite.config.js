import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => {
          const finalUrl = 'http://localhost:8080' + path;
          console.log('🔗 URL pour Postman :', finalUrl); // Ex: http://localhost:8087/api/users
          return path;
        },
        configure: (proxy, options) => {
          // Log avant l'envoi de la requête au backend
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'http://localhost:8080');  // Override manuel
            console.log('Headers envoyés au backend :', proxyReq.getHeaders());
          });
          // Log après la réponse du backend
          proxy.on('proxyRes', (proxyRes) => {
            console.log('Statut de la réponse du backend :', proxyRes.statusCode);
          });
        }
      }
    }
  }
})
