import { API_ORIGIN } from '../config/api';

/**
 * Turn DB media paths into a full URL for <img> / <video src>.
 * - Absolute http(s) URLs are unchanged.
 * - Root-relative paths (/assets/...) default to the API origin (served by Express static).
 * - Set VITE_ASSET_ORIGIN in .env to override (e.g. http://localhost:5173 if files only live in Vite public/).
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
    const origin =
      typeof import.meta !== 'undefined' && import.meta.env?.VITE_ASSET_ORIGIN
        ? import.meta.env.VITE_ASSET_ORIGIN.replace(/\/$/, '')
        : API_ORIGIN;
    return `${origin.replace(/\/$/, '')}${p}`;
  }
  return p;
}
