import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function assertNoLocalhostApiUrl(mode, label, value) {
  const v = String(value || '').trim()
  if (mode !== 'production' || !v) return
  if (!/^(https?:\/\/)?(localhost|127\.0\.0\.1)\b/i.test(v)) return
  throw new Error(
    `${label} must not use localhost in production builds (got: ${v}). ` +
      'On Netlify: Site configuration → Environment variables → set it to your Render HTTPS URL, ' +
      'e.g. https://YOUR-SERVICE.onrender.com/api. Remove localhost from Site env and from any committed .env used in CI.'
  )
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  assertNoLocalhostApiUrl(mode, 'VITE_API_BASE_URL', env.VITE_API_BASE_URL)
  assertNoLocalhostApiUrl(mode, 'VITE_API_ORIGIN', env.VITE_API_ORIGIN)
  assertNoLocalhostApiUrl(mode, 'VITE_ASSET_ORIGIN', env.VITE_ASSET_ORIGIN)

  if (process.env.NETLIFY === 'true' && mode === 'production') {
    const base = String(env.VITE_API_BASE_URL || '').trim()
    if (base) {
      console.log('[vite] Netlify: VITE_API_BASE_URL is set for this build.')
    } else {
      console.warn(
        '[vite] Netlify: VITE_API_BASE_URL is missing — Site settings → Environment variables → add it (Render URL + /api), then redeploy with clear cache.'
      )
    }
  }

  return {
    plugins: [react()],
    server: {
      open: true,
      host: true,
      port: 5173,
      // Dev default API is `/api` (see src/config/api.js); forward to Express on 5000.
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
