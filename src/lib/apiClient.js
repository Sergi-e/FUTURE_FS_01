import { API_BASE_URL } from '../config/api';

function parseJsonBody(text, url) {
  const raw = text == null ? '' : String(text);
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(
      `Empty response from ${url}. Common causes: Vercel function timeout (cold start + DB), or missing LIBSQL_URL / LIBSQL_AUTH_TOKEN on Production. Check /api/health (storage.libsqlConfigured) and Vercel → Functions → logs.`
    );
  }
  let data;
  try {
    data = JSON.parse(trimmed);
  } catch {
    const isHtml = /^\s*</.test(trimmed);
    throw new Error(
      isHtml
        ? `Got HTML instead of JSON from ${url}. The /api route may not be running, or the function timed out (Vercel Hobby ~10s). Fix VITE_* to same-origin /api, set Turso env vars, redeploy.`
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
    const err = new Error(typeof msg === 'string' ? msg : `HTTP ${res.status}`);
    err.status = res.status;
    if (data && typeof data === 'object' && typeof data.code === 'string') err.code = data.code;
    throw err;
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

/** GET with Bearer token (admin routes). */
export async function getJsonAuth(path, token) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${suffix}`;
  return fetchJson(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** POST JSON to API path under API_BASE_URL (e.g. `/contact`). */
export async function postJson(path, body, init = {}) {
  const { headers: extraHeaders, ...rest } = init;
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${suffix}`;
  return fetchJson(url, {
    ...rest,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(extraHeaders || {}) },
    body: JSON.stringify(body),
  });
}

/**
 * POST multipart image to /api/upload (admin JWT). Returns { path: '/assets/...' }.
 */
export async function uploadAdminImage(file, token) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = `${base}/upload`;
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  const text = await res.text();
  const data = parseJsonBody(text, url);
  if (!res.ok) {
    const msg = data && typeof data === 'object' && (data.error || data.message);
    const err = new Error(typeof msg === 'string' ? msg : `HTTP ${res.status}`);
    err.status = res.status;
    if (data && typeof data === 'object' && typeof data.code === 'string') err.code = data.code;
    throw err;
  }
  if (!data || typeof data.path !== 'string') {
    throw new Error('Upload response missing path');
  }
  return data;
}
