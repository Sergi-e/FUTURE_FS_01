const DEFAULT_ORIGIN = 'https://future-fs-01-huwr.onrender.com';

/** Backend API (JSON). Override with VITE_API_BASE_URL in .env.production when deploying. */
export const API_BASE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : `${DEFAULT_ORIGIN}/api`
).replace(/\/$/, '');

/** Origin of the API server (no /api). Used for root-relative media paths stored in the DB. */
export const API_ORIGIN = (
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_ORIGIN
    ? import.meta.env.VITE_API_ORIGIN
    : DEFAULT_ORIGIN
).replace(/\/$/, '');
