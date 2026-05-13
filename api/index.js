'use strict';

/**
 * Vercel serverless entry. Mongoose models, migrations, and seed data live in
 * `backend/database.js` so this function and the local Express server share a
 * single source of truth — no drift between the two seed paths, no duplicated
 * connection or counter logic, and the first request (cold start) always sees
 * a fully seeded database because `setupDatabase()` awaits the seed.
 */

const {
  setupDatabase,
  Admin,
  Project,
  Testimonial,
  Message,
  Setting,
  nextId,
} = require('../backend/database.js');

/** Shared helpers */
function pathOnly(req) {
  let u = req.url || '';
  if (u.includes('://')) { try { u = new URL(u).pathname; } catch { /* keep u */ } }
  return u.split('?')[0] || '/';
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(body));
}

async function getBody(req) {
  // Vercel may have already buffered the body as req.body
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => resolve(data));
    req.on('error', () => resolve(''));
  });
}

let _ephemeralJwtSecret = null;
let _warnedAboutMissingSecret = false;
/**
 * Returns the JWT signing secret. Refuses to fall back to a hardcoded default:
 * - Production (Vercel sets `VERCEL=1` / `NODE_ENV=production`): throws a 500
 *   so admin endpoints cannot be silently signed with a publicly-known secret.
 * - Non-production: generates a single random secret per Node process so dev
 *   tokens are unforgeable across machines and restarts.
 */
function getJwtSecret() {
  const fromEnv = String(process.env.JWT_SECRET || '').trim();
  if (fromEnv) return fromEnv;
  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true';
  if (isProd) {
    const err = new Error(
      'JWT_SECRET is not configured on the server. Set JWT_SECRET (a long random string) in your host environment (e.g. Vercel → Project Settings → Environment Variables) and redeploy.'
    );
    err.status = 500;
    err.code = 'JWT_SECRET_MISSING';
    throw err;
  }
  if (!_ephemeralJwtSecret) {
    _ephemeralJwtSecret = require('crypto').randomBytes(32).toString('hex');
  }
  if (!_warnedAboutMissingSecret) {
    _warnedAboutMissingSecret = true;
    console.warn('[api] JWT_SECRET is not set — using an ephemeral random secret for this process (development only). Set JWT_SECRET to keep admin sessions valid across restarts.');
  }
  return _ephemeralJwtSecret;
}

function verifyToken(req) {
  const jwt = require('jsonwebtoken');
  const secret = getJwtSecret();
  const auth = String(req.headers['authorization'] || '');
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  try { return jwt.verify(token, secret); } catch { throw Object.assign(new Error('Invalid token'), { status: 401 }); }
}

module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.statusCode = 204; res.end(); return;
  }

  const p = pathOnly(req);

  // --- Health (no DB) ---
  if (p === '/api/health') {
    return sendJson(res, 200, {
      ok: true, service: 'portfolio-api', via: 'api/index-direct',
      storage: {
        mongodbConfigured: Boolean(String(process.env.MONGODB_URI || '').trim()),
        cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
        dbPersistent: true, uploadsPersistent: true,
      },
    });
  }

  try {
    // --- Image Upload (Cloudinary, no DB) ---
    if (req.method === 'POST' && p === '/api/upload') {
      verifyToken(req);
      const Busboy = require('busboy');
      const bb = Busboy({ headers: req.headers });
      let fileBuffer = null, fileMime = 'image/jpeg';
      await new Promise((resolve, reject) => {
        bb.on('file', (_n, file, info) => {
          fileMime = info.mimeType || fileMime;
          const chunks = [];
          file.on('data', (d) => chunks.push(d));
          file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
        });
        bb.on('close', resolve); bb.on('error', reject);
        req.pipe(bb);
      });
      if (!fileBuffer) return sendJson(res, 400, { error: 'No file uploaded' });
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
      const result = await cloudinary.uploader.upload(`data:${fileMime};base64,${fileBuffer.toString('base64')}`, { folder: 'portfolio', resource_type: 'image' });
      return sendJson(res, 200, { path: result.secure_url, filename: result.public_id });
    }

    // All routes below this point need MongoDB. setupDatabase() connects once
    // per process AND awaits the seed, so the first request (cold start) never
    // observes an empty admin/projects/testimonials state. Warm invocations
    // return the cached promise immediately.
    await setupDatabase();

    // --- Login ---
    if (req.method === 'POST' && p === '/api/login') {
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');
      const secret = getJwtSecret();
      const body = JSON.parse(await getBody(req) || '{}');
      const { username, password } = body;
      if (!username || !password) return sendJson(res, 400, { error: 'username and password required' });
      const admin = await Admin.findOne({ username });
      if (!admin || !(await bcrypt.compare(password, admin.password))) return sendJson(res, 401, { error: 'Invalid credentials' });
      const token = jwt.sign({ id: admin.id, username: admin.username }, secret, { expiresIn: '12h' });
      return sendJson(res, 200, { token, username: admin.username });
    }

    // --- Auth: me ---
    if (req.method === 'GET' && p === '/api/auth/me') {
      const user = verifyToken(req);
      const admin = await Admin.findOne({ id: user.id });
      if (!admin) return sendJson(res, 404, { error: 'Not found' });
      return sendJson(res, 200, { id: admin.id, username: admin.username });
    }

    // --- Auth: change password ---
    if (req.method === 'PUT' && p === '/api/auth/password') {
      const user = verifyToken(req);
      const bcrypt = require('bcryptjs');
      const { currentPassword, newPassword } = JSON.parse(await getBody(req) || '{}');
      if (!currentPassword || !newPassword || newPassword.length < 8) return sendJson(res, 400, { error: 'Invalid request' });
      const admin = await Admin.findOne({ id: user.id });
      if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) return sendJson(res, 401, { error: 'Current password is incorrect' });
      admin.password = await bcrypt.hash(newPassword, 10);
      await admin.save();
      return sendJson(res, 200, { success: true });
    }

    // --- Auth: change username ---
    if (req.method === 'PUT' && p === '/api/auth/username') {
      const user = verifyToken(req);
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');
      const secret = getJwtSecret();
      const { currentPassword, newUsername } = JSON.parse(await getBody(req) || '{}');
      if (!currentPassword || !newUsername) return sendJson(res, 400, { error: 'Invalid request' });
      const admin = await Admin.findOne({ id: user.id });
      if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) return sendJson(res, 401, { error: 'Current password is incorrect' });
      admin.username = newUsername;
      await admin.save();
      const token = jwt.sign({ id: admin.id, username: newUsername }, secret, { expiresIn: '12h' });
      return sendJson(res, 200, { success: true, token, username: newUsername });
    }

    // --- Projects ---
    if (req.method === 'GET' && p === '/api/projects') {
      const projects = await Project.find().sort({ id: -1 }).lean();
      return sendJson(res, 200, projects.map(({ _id, __v, ...rest }) => rest));
    }
    if (req.method === 'POST' && p === '/api/projects') {
      verifyToken(req);
      const { title, subtitle, year, link, mediaType, mediaPath } = JSON.parse(await getBody(req) || '{}');
      const id = await nextId('project');
      await Project.create({ id, title, subtitle, year, link, mediaType, mediaPath });
      return sendJson(res, 200, { id, title, subtitle, year, link, mediaType, mediaPath });
    }
    if (req.method === 'DELETE' && /^\/api\/projects\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const result = await Project.findOneAndDelete({ id });
      if (!result) return sendJson(res, 404, { error: 'Project not found' });
      return sendJson(res, 200, { success: true });
    }
    if (req.method === 'PUT' && /^\/api\/projects\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const { title, subtitle, year, link, mediaType, mediaPath } = JSON.parse(await getBody(req) || '{}');
      await Project.findOneAndUpdate({ id }, { $set: { title, subtitle, year, link, mediaType, mediaPath } });
      return sendJson(res, 200, { success: true });
    }

    // --- Testimonials ---
    if (req.method === 'GET' && p === '/api/testimonials') {
      const testimonials = await Testimonial.find().sort({ id: 1 }).lean();
      return sendJson(res, 200, testimonials.map(({ _id, __v, ...rest }) => rest));
    }
    if (req.method === 'POST' && p === '/api/testimonials') {
      verifyToken(req);
      const { name, role, location, image, quote, tag } = JSON.parse(await getBody(req) || '{}');
      const id = await nextId('testimonial');
      await Testimonial.create({ id, name, role, location, image, quote, tag });
      return sendJson(res, 200, { id, name, role, location, image, quote, tag });
    }
    if (req.method === 'PUT' && /^\/api\/testimonials\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const { name, role, location, image, quote, tag } = JSON.parse(await getBody(req) || '{}');
      await Testimonial.findOneAndUpdate({ id }, { $set: { name, role, location, image, quote, tag } });
      return sendJson(res, 200, { success: true });
    }
    if (req.method === 'DELETE' && /^\/api\/testimonials\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const result = await Testimonial.findOneAndDelete({ id });
      if (!result) return sendJson(res, 404, { error: 'Testimonial not found' });
      return sendJson(res, 200, { success: true });
    }

    // --- Messages ---
    if (req.method === 'GET' && p === '/api/messages') {
      verifyToken(req);
      const messages = await Message.find().sort({ id: -1 }).lean();
      return sendJson(res, 200, messages.map(({ _id, __v, ...rest }) => rest));
    }
    if (req.method === 'PUT' && p === '/api/messages/mark-read') {
      verifyToken(req);
      await Message.updateMany({ is_read: 0 }, { $set: { is_read: 1 } });
      return sendJson(res, 200, { success: true });
    }
    if (req.method === 'DELETE' && /^\/api\/messages\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const result = await Message.findOneAndDelete({ id });
      if (!result) return sendJson(res, 404, { error: 'Message not found' });
      return sendJson(res, 200, { success: true });
    }

    // --- Contact ---
    if (req.method === 'POST' && p === '/api/contact') {
      const { name, email, message } = JSON.parse(await getBody(req) || '{}');
      const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || !email || !message) return sendJson(res, 400, { error: 'Name, email, and message are required.' });
      if (!EMAIL_RE.test(email)) return sendJson(res, 400, { error: 'Please enter a valid email address.' });
      const id = await nextId('message');
      await Message.create({ id, name, email, message, date: new Date().toISOString(), is_read: 0 });
      return sendJson(res, 200, { success: true });
    }

    // --- Settings ---
    if (req.method === 'GET' && p === '/api/settings/resume') {
      const setting = await Setting.findOne({ key: 'resume_url' }).lean();
      return sendJson(res, 200, { value: setting ? setting.value : '/Serge_Ishimwe_Resume.pdf' });
    }
    if (req.method === 'PUT' && p === '/api/settings/resume') {
      verifyToken(req);
      const { value } = JSON.parse(await getBody(req) || '{}');
      if (!value) return sendJson(res, 400, { error: 'Value is required' });
      await Setting.findOneAndUpdate({ key: 'resume_url' }, { $set: { value } }, { upsert: true });
      return sendJson(res, 200, { success: true, value });
    }

    return sendJson(res, 404, { error: 'not_found', path: p });
  } catch (err) {
    console.error('[api]', err.message);
    const status = err.status || 500;
    return sendJson(res, status, { error: err.message || 'internal_error' });
  }
};
