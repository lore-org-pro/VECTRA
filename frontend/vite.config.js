import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const isVercel = process.env.VERCEL === '1';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // basicSsl only for local dev (Vercel handles HTTPS natively)
    ...(!isVercel ? [(await import('@vitejs/plugin-basic-ssl')).default()] : [])
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/cache': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
