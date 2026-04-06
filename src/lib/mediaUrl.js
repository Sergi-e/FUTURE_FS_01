import { API_ORIGIN } from '../config/api';

/**
 * Turn DB media paths into a full URL for <img> / <video src>.
 * - Absolute http(s) URLs are unchanged.
 * - Root-relative `/assets/...` (and other `/...` paths): see resolution order below.
 *
 * Resolution order:
 * 1. VITE_ASSET_ORIGIN — use when media is only on the API host (e.g. Render serves backend/public/assets).
 * 2. In the browser (not file:), same origin as the page — use when you ship files in Vite `public/assets`
 *    (static host). This avoids broken media when the API does not serve those static files.
 * 3. API_ORIGIN — fallback for SSR, file://, or when window is unavailable.
 */
export function resolveMediaUrl(path) {
  if (path == null || typeof path !== 'string') return '';
  const p = path.trim();
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith('//')) {
    if (typeof window === 'undefined') return `https:${p}`;
    return `${window.location.protocol}${p}`;
  }
  if (p.startsWith('/')) {
    const envOrigin =
      typeof import.meta !== 'undefined' && import.meta.env?.VITE_ASSET_ORIGIN
        ? import.meta.env.VITE_ASSET_ORIGIN.replace(/\/$/, '')
        : '';
    if (envOrigin) return `${envOrigin}${p}`;

    const apiOrigin = API_ORIGIN.replace(/\/$/, '');
    if (
      typeof window !== 'undefined' &&
      window.location?.origin &&
      window.location.protocol !== 'file:'
    ) {
      return `${window.location.origin.replace(/\/$/, '')}${p}`;
    }
    return `${apiOrigin}${p}`;
  }
  return p;
}
