'use strict';

/**
 * Vercel invokes this for /api (rewritten from /api/*).
 * IMPORTANT: /api/health responds inline (no Express) for fast cold starts.
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
  const mongodbConfigured = Boolean(String(process.env.MONGODB_URI || '').trim());
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
      mongodbConfigured,
      cloudinaryConfigured,
      uploadsDirConfigured: Boolean(process.env.PORTFOLIO_UPLOADS_DIR),
      dbPersistent: mongodbConfigured,
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
