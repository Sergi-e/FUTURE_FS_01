/** Local backend default (see backend/server.js PORT). Production must set Netlify env vars. */
const defaultOrigin =
  typeof import.meta !== 'undefined' && import.meta.env?.DEV
    ? 'http://localhost:5000'
    : '';

function isLocalhostUrl(value) {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1)\b/i.test(String(value || '').trim());
}

/**
 * In production, never trust localhost in VITE_* (common mistake: copying .env into Netlify).
 * Fall back to dev default logic so the bundle cannot phone home to the visitor's machine.
 */
function viteApiBaseUrl() {
  const raw =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
      ? String(import.meta.env.VITE_API_BASE_URL).trim()
      : '';
  if (
    raw &&
    typeof import.meta !== 'undefined' &&
    import.meta.env?.PROD &&
    isLocalhostUrl(raw)
  ) {
    console.error(
      '[portfolio] VITE_API_BASE_URL is set to localhost in a production bundle — fix Netlify env (use https://YOUR-SERVICE.onrender.com/api) and redeploy.'
    );
    return '';
  }
  return raw;
}

function viteApiOrigin() {
  const raw =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_ORIGIN
      ? String(import.meta.env.VITE_API_ORIGIN).trim()
      : '';
  if (
    raw &&
    typeof import.meta !== 'undefined' &&
    import.meta.env?.PROD &&
    isLocalhostUrl(raw)
  ) {
    console.error(
      '[portfolio] VITE_API_ORIGIN must not be localhost in production. Set it to your Render origin (https://YOUR-SERVICE.onrender.com).'
    );
    return '';
  }
  return raw;
}

/**
 * JSON API base URL.
 * - Dev + no VITE_API_BASE_URL: `/api` so the browser hits the Vite dev server; `vite.config.js` proxies to the backend on port 5000.
 * - Dev + VITE_* set: use that (e.g. Render) and skip the proxy for API calls.
 * - Production: env or `/api` relative (Netlify + split host must set env).
 */
function resolvedApiBaseUrl() {
  const fromEnv = viteApiBaseUrl();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return '/api';
  }
  return `${defaultOrigin}/api`.replace(/\/$/, '');
}

/** Backend API (JSON). Set VITE_API_BASE_URL on Netlify (e.g. https://YOUR-SERVICE.onrender.com/api). */
export const API_BASE_URL = resolvedApiBaseUrl();

/** Origin of the API server (no /api). Used for root-relative media paths stored in the DB. */
export const API_ORIGIN = (viteApiOrigin() || defaultOrigin).replace(/\/$/, '');

/** Raw env as baked at build time (still "localhost" even if we strip it for API_BASE_URL in prod). */
function rawViteApiBaseUrl() {
  return typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).trim()
    : '';
}

if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) {
  const raw = rawViteApiBaseUrl();
  if (!raw) {
    console.error(
      '[portfolio] VITE_API_BASE_URL is unset. Built-in fetch uses relative "/api", which on Netlify returns the SPA HTML, not JSON. Set VITE_API_BASE_URL (e.g. https://your-service.onrender.com/api) and VITE_API_ORIGIN, then trigger a fresh deploy with cache clear.'
    );
  } else if (isLocalhostUrl(raw)) {
    console.error(
      '[portfolio] VITE_API_BASE_URL was localhost at build time — it is ignored in the bundle, but you must set Netlify env to your Render HTTPS URL and redeploy so the next build bakes the correct value.'
    );
  }
}

/**
 * Shown when API fetch fails — different copy for `npm run dev` vs production (Netlify).
 */
export function apiSetupHintParagraph() {
  const dev =
    typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  if (dev) {
    return (
      'You are in Vite dev mode. Run `npm run dev:stack` from the project root to start both the API (port 5000) and this dev server, ' +
      'or keep `npm run dev` and in a second terminal run `cd backend` then `npm start`. ' +
      'Alternatively add a root `.env.local` with VITE_API_BASE_URL / VITE_API_ORIGIN pointing at Render. ' +
      'Netlify-only instructions apply after `npm run build`.'
    );
  }
  return (
    'This is a production build. In Netlify: Site configuration → Environment variables → set VITE_API_BASE_URL to ' +
    'https://YOUR-SERVICE.onrender.com/api and VITE_API_ORIGIN to https://YOUR-SERVICE.onrender.com (HTTPS, not localhost). ' +
    'Then Deploys → Trigger deploy → Clear cache and deploy site. Push your latest git commit so Netlify rebuilds; ' +
    'hard-refresh the page (Ctrl+Shift+R) after deploy.'
  );
}