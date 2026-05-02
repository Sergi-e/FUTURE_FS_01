'use strict';

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

function verifyToken(req) {
  const jwt = require('jsonwebtoken');
  const secret = String(process.env.JWT_SECRET || 'super_secret_key_123').trim();
  const auth = String(req.headers['authorization'] || '');
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  try { return jwt.verify(token, secret); } catch { throw Object.assign(new Error('Invalid token'), { status: 401 }); }
}

let _mongoose = null;
async function getMongo() {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) { _mongoose = mongoose; return mongoose; }
  const uri = String(process.env.MONGODB_URI || '').trim();
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 20000 });
  _mongoose = mongoose;
  return mongoose;
}

function getModels(mongoose) {
  const { Schema } = mongoose;
  const Counter = mongoose.models.Counter || mongoose.model('Counter', new Schema({ _id: String, seq: { type: Number, default: 0 } }));
  const Admin = mongoose.models.Admin || mongoose.model('Admin', new Schema({ id: Number, username: String, password: String }));
  const Project = mongoose.models.Project || mongoose.model('Project', new Schema({ id: Number, title: String, subtitle: String, year: String, link: String, mediaType: String, mediaPath: String }));
  const Testimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', new Schema({ id: Number, name: String, role: String, location: String, image: String, quote: String, tag: String }));
  const Message = mongoose.models.Message || mongoose.model('Message', new Schema({ id: Number, name: String, email: String, message: String, date: String, is_read: { type: Number, default: 0 } }));
  const Setting = mongoose.models.Setting || mongoose.model('Setting', new Schema({ key: String, value: String }));
  return { Counter, Admin, Project, Testimonial, Message, Setting };
}

async function nextId(Counter, name) {
  const r = await Counter.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return r.seq;
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
    // --- Image Upload ---
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

    // --- Login ---
    if (req.method === 'POST' && p === '/api/login') {
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');
      const secret = String(process.env.JWT_SECRET || 'super_secret_key_123').trim();
      const body = JSON.parse(await getBody(req) || '{}');
      const { username, password } = body;
      if (!username || !password) return sendJson(res, 400, { error: 'username and password required' });
      const mongoose = await getMongo();
      const { Admin, Counter } = getModels(mongoose);
      let admin = await Admin.findOne({ username });
      // Auto-seed admin on first deployment if none exists
      if (!admin) {
        const count = await Admin.countDocuments();
        if (count === 0) {
          const id = await nextId(Counter, 'admin');
          const hash = await bcrypt.hash('admin123', 10);
          admin = await Admin.create({ id, username: 'admin', password: hash });
        }
      }
      if (!admin || !(await bcrypt.compare(password, admin.password))) return sendJson(res, 401, { error: 'Invalid credentials' });
      const token = jwt.sign({ id: admin.id, username: admin.username }, secret, { expiresIn: '12h' });
      return sendJson(res, 200, { token, username: admin.username });
    }

    // --- Auth: me ---
    if (req.method === 'GET' && p === '/api/auth/me') {
      const user = verifyToken(req);
      const mongoose = await getMongo();
      const { Admin } = getModels(mongoose);
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
      const mongoose = await getMongo();
      const { Admin } = getModels(mongoose);
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
      const secret = String(process.env.JWT_SECRET || 'super_secret_key_123').trim();
      const { currentPassword, newUsername } = JSON.parse(await getBody(req) || '{}');
      if (!currentPassword || !newUsername) return sendJson(res, 400, { error: 'Invalid request' });
      const mongoose = await getMongo();
      const { Admin } = getModels(mongoose);
      const admin = await Admin.findOne({ id: user.id });
      if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) return sendJson(res, 401, { error: 'Current password is incorrect' });
      admin.username = newUsername;
      await admin.save();
      const token = jwt.sign({ id: admin.id, username: newUsername }, secret, { expiresIn: '12h' });
      return sendJson(res, 200, { success: true, token, username: newUsername });
    }

    // --- Projects ---
    if (req.method === 'GET' && p === '/api/projects') {
      const mongoose = await getMongo();
      const { Project } = getModels(mongoose);
      const projects = await Project.find().sort({ id: -1 }).lean();
      return sendJson(res, 200, projects.map(({ _id, __v, ...rest }) => rest));
    }
    if (req.method === 'POST' && p === '/api/projects') {
      verifyToken(req);
      const mongoose = await getMongo();
      const { Counter, Project } = getModels(mongoose);
      const { title, subtitle, year, link, mediaType, mediaPath } = JSON.parse(await getBody(req) || '{}');
      const id = await nextId(Counter, 'project');
      await Project.create({ id, title, subtitle, year, link, mediaType, mediaPath });
      return sendJson(res, 200, { id, title, subtitle, year, link, mediaType, mediaPath });
    }
    if (req.method === 'DELETE' && /^\/api\/projects\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const mongoose = await getMongo();
      const { Project } = getModels(mongoose);
      const result = await Project.findOneAndDelete({ id });
      if (!result) return sendJson(res, 404, { error: 'Project not found' });
      return sendJson(res, 200, { success: true });
    }
    if (req.method === 'PUT' && /^\/api\/projects\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const mongoose = await getMongo();
      const { Project } = getModels(mongoose);
      const { title, subtitle, year, link, mediaType, mediaPath } = JSON.parse(await getBody(req) || '{}');
      await Project.findOneAndUpdate({ id }, { $set: { title, subtitle, year, link, mediaType, mediaPath } });
      return sendJson(res, 200, { success: true });
    }

    // --- Testimonials ---
    if (req.method === 'GET' && p === '/api/testimonials') {
      const mongoose = await getMongo();
      const { Testimonial } = getModels(mongoose);
      const testimonials = await Testimonial.find().sort({ id: 1 }).lean();
      return sendJson(res, 200, testimonials.map(({ _id, __v, ...rest }) => rest));
    }
    if (req.method === 'POST' && p === '/api/testimonials') {
      verifyToken(req);
      const mongoose = await getMongo();
      const { Counter, Testimonial } = getModels(mongoose);
      const { name, role, location, image, quote, tag } = JSON.parse(await getBody(req) || '{}');
      const id = await nextId(Counter, 'testimonial');
      await Testimonial.create({ id, name, role, location, image, quote, tag });
      return sendJson(res, 200, { id, name, role, location, image, quote, tag });
    }
    if (req.method === 'PUT' && /^\/api\/testimonials\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const mongoose = await getMongo();
      const { Testimonial } = getModels(mongoose);
      const { name, role, location, image, quote, tag } = JSON.parse(await getBody(req) || '{}');
      await Testimonial.findOneAndUpdate({ id }, { $set: { name, role, location, image, quote, tag } });
      return sendJson(res, 200, { success: true });
    }
    if (req.method === 'DELETE' && /^\/api\/testimonials\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const mongoose = await getMongo();
      const { Testimonial } = getModels(mongoose);
      await Testimonial.deleteOne({ id });
      return sendJson(res, 200, { success: true });
    }

    // --- Messages ---
    if (req.method === 'GET' && p === '/api/messages') {
      verifyToken(req);
      const mongoose = await getMongo();
      const { Message } = getModels(mongoose);
      const messages = await Message.find().sort({ id: -1 }).lean();
      return sendJson(res, 200, messages.map(({ _id, __v, ...rest }) => rest));
    }
    if (req.method === 'PUT' && p === '/api/messages/mark-read') {
      verifyToken(req);
      const mongoose = await getMongo();
      const { Message } = getModels(mongoose);
      await Message.updateMany({ is_read: 0 }, { $set: { is_read: 1 } });
      return sendJson(res, 200, { success: true });
    }
    if (req.method === 'DELETE' && /^\/api\/messages\/\d+$/.test(p)) {
      verifyToken(req);
      const id = Number(p.split('/').pop());
      const mongoose = await getMongo();
      const { Message } = getModels(mongoose);
      await Message.findOneAndDelete({ id });
      return sendJson(res, 200, { success: true });
    }

    // --- Contact ---
    if (req.method === 'POST' && p === '/api/contact') {
      const mongoose = await getMongo();
      const { Counter, Message } = getModels(mongoose);
      const { name, email, message } = JSON.parse(await getBody(req) || '{}');
      const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || !email || !message) return sendJson(res, 400, { error: 'Name, email, and message are required.' });
      if (!EMAIL_RE.test(email)) return sendJson(res, 400, { error: 'Please enter a valid email address.' });
      const id = await nextId(Counter, 'message');
      await Message.create({ id, name, email, message, date: new Date().toISOString(), is_read: 0 });
      return sendJson(res, 200, { success: true });
    }

    // --- Settings ---
    if (req.method === 'GET' && p === '/api/settings/resume') {
      const mongoose = await getMongo();
      const { Setting } = getModels(mongoose);
      const setting = await Setting.findOne({ key: 'resume_url' }).lean();
      return sendJson(res, 200, { value: setting ? setting.value : '/Serge_Ishimwe_Resume_Portifolio.pdf' });
    }
    if (req.method === 'PUT' && p === '/api/settings/resume') {
      verifyToken(req);
      const mongoose = await getMongo();
      const { Setting } = getModels(mongoose);
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
