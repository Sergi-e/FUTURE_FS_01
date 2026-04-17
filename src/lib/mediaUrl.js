import { API_ORIGIN } from '../config/api';

/** Root-relative path to a file in Vite `public/` (works with non-root BASE_URL). */
export function publicAssetPath(rootRelativePath) {
  const p = rootRelativePath.startsWith('/') ? rootRelativePath : `/${rootRelativePath}`;
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : '/'
  ).replace(/\/$/, '');
  return `${base}${p}`;
}
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
 * In Vite dev (local API), `/assets/…` uses the page hostname with the API port so Network/LAN URLs
 * (e.g. phone on http://192.168.x.x:5173) still load uploads from the machine running Express.
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
    if (apiOrigin && /^\/assets\//i.test(p)) {
      let originForAssets = apiOrigin;
      const usingRemoteApi = Boolean(
        typeof import.meta !== 'undefined' && String(import.meta.env?.VITE_API_BASE_URL || '').trim()
      );
      if (
        typeof import.meta !== 'undefined' &&
        import.meta.env.DEV &&
        !usingRemoteApi &&
        typeof window !== 'undefined' &&
        window.location?.hostname &&
        window.location.protocol !== 'file:'
      ) {
        try {
          const parsed = new URL(apiOrigin.includes('://') ? apiOrigin : `http://${apiOrigin}`);
          const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
          const host = window.location.hostname;
          originForAssets = `${parsed.protocol}//${host}:${port}`;
        } catch {
          /* keep apiOrigin */
        }
      }
      return `${originForAssets.replace(/\/$/, '')}${p}`;
    }

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
