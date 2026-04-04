import { API_ORIGIN } from '../config/api';

/**
 * Turn DB media paths into a full URL for <img> / <video src>.
 * - Absolute http(s) URLs are unchanged.
 * - Root-relative paths (/assets/...) use the current site origin by default (same as src="/assets/…"
 *   on the deployed or dev app, where public/ files are served).
 * - Set VITE_ASSET_ORIGIN to force a host (e.g. https://future-fs-01-huwr.onrender.com if media is only on the API).
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
    let origin = envOrigin;
    if (!origin && typeof window !== 'undefined' && window.location?.origin && window.location.protocol !== 'file:') {
      origin = window.location.origin;
    }
    if (!origin) origin = API_ORIGIN;
    return `${origin.replace(/\/$/, '')}${p}`;
  }
  return p;
}
