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
    allowedHosts: true, // Allows all preview and cloud sandbox hosts (e.g. *.vercel.run, *.vercel.app)
  },
  preview: {
    host: true,
    allowedHosts: true,
  }
})
