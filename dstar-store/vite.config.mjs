import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('/node_modules/gsap')) return 'gsap';
        }
      },
      input: {
        main:            resolve(__dirname, 'index.html'),
        producto:        resolve(__dirname, 'producto.html'),
        checkout:        resolve(__dirname, 'checkout.html'),
        gracias:         resolve(__dirname, 'gracias.html'),
        agradecimientos: resolve(__dirname, 'agradecimientos.html'),
        errorPago:       resolve(__dirname, 'error-pago.html'),
        pagoPendiente:   resolve(__dirname, 'pago-pendiente.html'),
        blogBts:         resolve(__dirname, 'blog/born-to-shine-detras-del-drop.html'),
        blogCuidar:      resolve(__dirname, 'blog/como-cuidar-tu-ropa.html'),
        blogStreet:      resolve(__dirname, 'blog/streetwear-mexico-escena.html'),
      }
    }
  },
  plugins: [
    legacy({ targets: ['defaults', 'not IE 11'] })
  ]
});
