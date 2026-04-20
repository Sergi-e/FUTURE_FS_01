'use strict';

/**
 * Vercel invokes this for /api (rewritten from /api/*).
 * IMPORTANT: /api/health must respond WITHOUT loading Express/sql.js/Turso — Hobby ~10s limit.
 */
function pathOnly(req) {
  let u = req.url || '';
  if (u.includes('://')) {
    try {
      u = new URL(u).pathname;
    } catch {
      /* keep u */
    }
  }
  return u.split('?')[0] || '/';
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function sendHealth(req, res) {
  const libsqlConfigured = Boolean(
    String(process.env.LIBSQL_URL || '').trim() && String(process.env.LIBSQL_AUTH_TOKEN || '').trim()
  );
  const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
  sendJson(res, 200, {
    ok: true,
    service: 'portfolio-api',
    via: 'api/index-health',
    storage: {
      libsqlConfigured,
      cloudinaryConfigured,
      dbPathConfigured: Boolean(process.env.PORTFOLIO_DB_PATH),
      uploadsDirConfigured: Boolean(process.env.PORTFOLIO_UPLOADS_DIR),
      dbPersistent: libsqlConfigured || Boolean(process.env.PORTFOLIO_DB_PATH),
      uploadsPersistent: cloudinaryConfigured || Boolean(process.env.PORTFOLIO_UPLOADS_DIR),
    },
  });
}

let serverlessHandler;

module.exports = (req, res) => {
  const p = pathOnly(req);

  if (req.method === 'GET' && (p === '/api/health' || p === '/api/health/')) {
    return sendHealth(req, res);
  }

  if (process.env.VERCEL) {
    const u = req.url || '';
    if (u && !u.startsWith('/api') && !u.includes('://')) {
      req.url = '/api' + (u.startsWith('/') ? u : `/${u}`);
    }
  }

  if (!serverlessHandler) {
    const serverless = require('serverless-http');
    const { app } = require('../backend/server.js');
    serverlessHandler = serverless(app);
  }

  return serverlessHandler(req, res);
};
