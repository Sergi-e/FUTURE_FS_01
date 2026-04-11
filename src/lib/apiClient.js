import { API_BASE_URL } from '../config/api';

function parseJsonBody(text, url) {
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    const isHtml = /^\s*</.test(text);
    throw new Error(
      isHtml
        ? `Got HTML instead of JSON from ${url}. Set VITE_API_BASE_URL on your static host (full Render URL including /api) and redeploy.`
        : `Invalid JSON from ${url}`
    );
  }
  return data;
}

/**
 * fetch + parse JSON with clear errors if the host returns SPA HTML instead of JSON.
 * Throws when the response is not OK (message from body when available).
 */
export async function fetchJson(url, init = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  const data = parseJsonBody(text, url);
  if (!res.ok) {
    const msg = data && typeof data === 'object' && (data.error || data.message);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

/**
 * Same JSON parsing as fetchJson, but returns status for callers that handle !ok (e.g. login).
 */
export async function fetchJsonWithStatus(url, init = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  const data = parseJsonBody(text, url);
  return { ok: res.ok, status: res.status, data };
}

/**
 * GET JSON from the portfolio API (path under API_BASE_URL, e.g. `/projects`).
 */
export async function getJson(path) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${suffix}`;
  return fetchJson(url);
}
