import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Root Vite configuration for web containers, StackBlitz & Vercel Preview
export default defineConfig({
  root: path.resolve(__dirname, 'frontend'),
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
