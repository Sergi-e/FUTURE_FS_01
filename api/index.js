'use strict';

const serverless = require('serverless-http');

const { app } = require('../backend/server.js');

const handler = serverless(app);

/**
 * Vercel may invoke this function with paths like `/projects` instead of `/api/projects`.
 * Express routes are registered under `/api/...`, so normalize when needed.
 */
module.exports = (req, res) => {
  if (process.env.VERCEL) {
    const u = req.url || '';
    if (u && !u.startsWith('/api')) {
      req.url = '/api' + (u.startsWith('/') ? u : `/${u}`);
    }
  }
  return handler(req, res);
};
