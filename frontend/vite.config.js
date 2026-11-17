import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    allowedHosts: true,
    // Local dev: run `php -S localhost:8000 -t backend/public backend/public/index.php`
    // and leave VITE_API_BASE_URL unset; /api calls are proxied to PHP.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  preview: {
    host: true,
    allowedHosts: true,
  }
})
