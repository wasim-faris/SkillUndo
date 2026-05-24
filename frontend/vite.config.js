import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendDir = path.resolve(__dirname, '../backend')

function serveBackendMedia() {
  const mediaRoots = {
    '/profile_photos/': path.join(backendDir, 'profile_photos'),
    '/banners/': path.join(backendDir, 'banners'),
  }

  return {
    name: 'serve-backend-uploaded-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const mediaPrefix = Object.keys(mediaRoots).find((prefix) => req.url?.startsWith(prefix))
        if (!mediaPrefix) {
          next()
          return
        }

        const relativePath = decodeURIComponent(req.url.slice(mediaPrefix.length).split('?')[0])
        const filePath = path.resolve(mediaRoots[mediaPrefix], relativePath)

        if (!filePath.startsWith(mediaRoots[mediaPrefix]) || !fs.existsSync(filePath)) {
          next()
          return
        }

        const extension = path.extname(filePath).toLowerCase()
        const contentTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
        }

        res.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'no-store')
        fs.createReadStream(filePath).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveBackendMedia()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
