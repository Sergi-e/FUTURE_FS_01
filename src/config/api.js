/** Local backend default (see backend/server.js PORT). Production must set Netlify env vars. */
const defaultOrigin =
  typeof import.meta !== 'undefined' && import.meta.env?.DEV
    ? 'http://localhost:5000'
    : '';

/** Backend API (JSON). Set VITE_API_BASE_URL on Netlify (e.g. https://YOUR-SERVICE.onrender.com/api). */
export const API_BASE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : `${defaultOrigin}/api`
).replace(/\/$/, '');

/** Origin of the API server (no /api). Used for root-relative media paths stored in the DB. */
export const API_ORIGIN = (
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_ORIGIN
    ? import.meta.env.VITE_API_ORIGIN
    : defaultOrigin
).replace(/\/$/, '');
