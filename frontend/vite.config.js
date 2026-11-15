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
    allowedHosts: [
      'sb-xyfuax29p9rv.vercel.run',
      '.vercel.run',
      '.vercel.app',
      'localhost',
      '127.0.0.1',
    ],
  },
  preview: {
    host: true,
    allowedHosts: [
      'sb-xyfuax29p9rv.vercel.run',
      '.vercel.run',
      '.vercel.app',
      'localhost',
      '127.0.0.1',
    ],
  }
})
