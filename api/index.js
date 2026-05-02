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

module.exports = async (req, res) => {
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

  // Handle login directly (bypass Express to avoid cold-start stall)
  if (req.method === 'POST' && (p === '/api/login' || p === '/api/login/')) {
    try {
      const mongoose = require('mongoose');
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');
      const uri = String(process.env.MONGODB_URI || '').trim();
      const secret = String(process.env.JWT_SECRET || 'super_secret_key_123').trim();

      if (!uri) return sendJson(res, 503, { error: 'database_not_configured' });

      // Read body
      const body = await new Promise((resolve) => {
        let data = '';
        req.on('data', (c) => { data += c; });
        req.on('end', () => resolve(data));
      });
      const { username, password } = JSON.parse(body || '{}');
      if (!username || !password) return sendJson(res, 400, { error: 'username and password required' });

      // Connect
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 20000 });
      }

      // Admin schema (idempotent)
      const Admin = mongoose.models.Admin || mongoose.model('Admin', new mongoose.Schema({
        id: Number, username: String, password: String,
      }));

      const admin = await Admin.findOne({ username });
      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return sendJson(res, 401, { error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: admin.id, username: admin.username }, secret, { expiresIn: '12h' });
      return sendJson(res, 200, { token, username: admin.username });
    } catch (err) {
      console.error('[login]', err.message);
      return sendJson(res, 500, { error: 'login_error', message: err.message });
    }
  }

  try {
    // Pre-connect Mongoose so Express's ensureDb() finds it already connected
    const mongoose = require('mongoose');
    const uri = String(process.env.MONGODB_URI || '').trim();
    if (uri && mongoose.connection.readyState !== 1) {
      // Pre-initialise the global cache BEFORE loading server.js/database.js
      // so database.js reuses our connection instead of starting its own
      if (!global.__portfolioMongoose) {
        global.__portfolioMongoose = { conn: null, promise: null };
      }
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 20000 });
      global.__portfolioMongoose.conn = conn;
      global.__portfolioMongoose.promise = Promise.resolve(conn);
    } else if (uri && global.__portfolioMongoose && !global.__portfolioMongoose.conn) {
      const mongoose2 = require('mongoose');
      global.__portfolioMongoose.conn = mongoose2;
      global.__portfolioMongoose.promise = Promise.resolve(mongoose2);
    }

    if (!serverlessHandler) {
      const serverless = require('serverless-http');
      const { app } = require('../backend/server.js');
      serverlessHandler = serverless(app);
    }
    return await serverlessHandler(req, res);
  } catch (err) {
    console.error('[api/index crash]', err.stack || err.message);
    return sendJson(res, 500, { error: 'internal', message: err.message });
  }
};
