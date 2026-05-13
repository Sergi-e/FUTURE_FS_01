// Vercel injects env at runtime — dotenv is not bundled in serverless; skip to avoid "Cannot find module 'dotenv'".
if (!process.env.VERCEL) {
  require('dotenv').config();
}
const fs = require('fs');
const https = require('https');
const path = require('path');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  setupDatabase,
  isMongoConfigured,
  Admin,
  Project,
  Message,
  Testimonial,
  Setting,
  nextId,
} = require('./database');

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * JWT signing secret. Refuses to fall back to a hardcoded default so a known
 * value can never be used to forge admin tokens. In production we exit the
 * process with a clear message; in development we generate a random
 * per-process secret so dev tokens remain unforgeable across restarts.
 */
const JWT_SECRET = (() => {
  const fromEnv = String(process.env.JWT_SECRET || '').trim();
  if (fromEnv) return fromEnv;
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  if (isProd) {
    console.error('[api] JWT_SECRET is not configured. Set JWT_SECRET (a long random string) in your host environment and restart.');
    process.exit(1);
  }
  const generated = require('crypto').randomBytes(32).toString('hex');
  console.warn('[api] JWT_SECRET is not set — using an ephemeral random secret for this process (development only). Set JWT_SECRET to keep admin sessions valid across restarts.');
  return generated;
})();

app.set('trust proxy', 1);
app.disable('x-powered-by');

const ALLOWED_ORIGINS = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
];
if (process.env.FRONTEND_URL) {
  ALLOWED_ORIGINS.push(new RegExp(`^${process.env.FRONTEND_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.some((r) => r.test(origin))) return callback(null, true);
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/** Needed for Vercel serverless: DB init before route handlers run (no prior `app.listen`). */
async function ensureDb() {
  await setupDatabase();
}

app.use(async (req, res, next) => {
  try {
    const p = req.path || '';
    // Fast paths for Vercel serverless: avoid Mongo init before health handler runs.
    if (req.method === 'OPTIONS') return next();
    if (req.method === 'GET' && (p === '/' || p === '/api/health')) {
      return next();
    }
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

// Register JSON routes BEFORE static files so nothing intercepts /api/*
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    service: 'portfolio-api',
    try: ['/api/health', '/api/projects', '/api/testimonials'],
  });
});

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const mongodbConfigured = isMongoConfigured();
  const cloudinaryConfigured = isCloudinaryConfigured();
  const uploadsDirConfigured = Boolean(process.env.PORTFOLIO_UPLOADS_DIR);
  const dbPersistent = mongodbConfigured;
  const uploadsPersistent = cloudinaryConfigured || uploadsDirConfigured;
  const onPaaS =
    process.env.RENDER === 'true' ||
    process.env.RENDER === '1' ||
    process.env.VERCEL === '1' ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    Boolean(process.env.FLY_APP_NAME) ||
    Boolean(process.env.DYNO);
  let ephemeralWarning;
  if (onPaaS && (!dbPersistent || !uploadsPersistent)) {
    const parts = [];
    if (!dbPersistent) {
      parts.push('Database is not configured. Set MONGODB_URI (MongoDB Atlas) in your host environment variables.');
    }
    if (!uploadsPersistent) {
      parts.push(
        'Admin image uploads are ephemeral. Set CLOUDINARY_* env vars, or PORTFOLIO_UPLOADS_DIR on a persistent disk.'
      );
    }
    ephemeralWarning = parts.join(' ');
  }
  res.status(200).json({
    ok: true,
    storage: {
      mongodbConfigured,
      cloudinaryConfigured,
      uploadsDirConfigured,
      dbPersistent,
      uploadsPersistent,
      ...(ephemeralWarning ? { ephemeralWarning } : {}),
    },
    /** @deprecated use storage.mongodbConfigured */
    db: {
      mongodbConfigured,
      ...(ephemeralWarning ? { ephemeralWarning } : {}),
    },
  });
});

// Serve the built React frontend when it exists (production: dist/ is copied next to server.js)
const FRONTEND_DIST = path.join(__dirname, 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

// Bundled media from the repo; uploads may live on a persistent volume (see PORTFOLIO_UPLOADS_DIR).
const BUNDLED_ASSETS_DIR = path.join(__dirname, 'public', 'assets');
const UPLOADS_DIR = process.env.PORTFOLIO_UPLOADS_DIR
  ? path.resolve(process.env.PORTFOLIO_UPLOADS_DIR)
  : BUNDLED_ASSETS_DIR;

// Project/testimonial media paths in the DB are like /assets/foo.png — try bundled files, then persistent uploads
app.use('/assets', express.static(BUNDLED_ASSETS_DIR));
app.use('/assets', express.static(UPLOADS_DIR));

function ensureAssetsUploadDir() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const uploadImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureAssetsUploadDir();
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const safeExt = allowed.includes(ext) ? ext : '.jpg';
    cb(null, `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`);
  },
});

const uploadImage = multer({
  storage: isCloudinaryConfigured() ? multer.memoryStorage() : uploadImageStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed'));
  },
});

/** Route async errors -> Express error middleware (avoids unhandled rejections). */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Basic auth middleware
const authenticate = (req, res, next) => {
  const raw = req.headers.authorization;
  const token =
    typeof raw === 'string' && raw.startsWith('Bearer ')
      ? raw.slice(7).trim()
      : raw?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized', code: 'no_token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      const expired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        error: expired ? 'Session expired. Please log in again.' : 'Invalid session. Please log in again.',
        code: expired ? 'token_expired' : 'token_invalid',
      });
    }
    req.user = user;
    next();
  });
};

// --- Auth ---
app.post(
  '/api/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '12h' });
      res.json({ token, username: admin.username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  })
);

app.get('/api/verify', authenticate, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.get(
  '/api/auth/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const row = await Admin.findOne({ id: req.user.id }).select('id username').lean();
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ id: row.id, username: row.username });
  })
);

app.put(
  '/api/auth/password',
  authenticate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    const admin = await Admin.findOne({ id: req.user.id });
    if (!admin) return res.status(404).json({ error: 'Account not found' });
    if (!(await bcrypt.compare(currentPassword, admin.password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    admin.password = hash;
    await admin.save();
    res.json({ success: true });
  })
);

app.put(
  '/api/auth/username',
  authenticate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newUsername } = req.body || {};
    const name = String(newUsername || '').trim();
    if (!currentPassword || !name) {
      return res.status(400).json({ error: 'Current password and new username are required' });
    }
    if (name.length < 2 || name.length > 64) {
      return res.status(400).json({ error: 'Username must be between 2 and 64 characters' });
    }
    const admin = await Admin.findOne({ id: req.user.id });
    if (!admin) return res.status(404).json({ error: 'Account not found' });
    if (!(await bcrypt.compare(currentPassword, admin.password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const taken = await Admin.findOne({ username: name, id: { $ne: req.user.id } });
    if (taken) return res.status(409).json({ error: 'That username is already in use' });
    admin.username = name;
    await admin.save();
    const token = jwt.sign({ id: admin.id, username: name }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token, username: name });
  })
);

// --- Projects ---
app.get(
  '/api/projects',
  asyncHandler(async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const projects = await Project.find().sort({ id: -1 });
    res.json(projects.map((p) => p.toJSON()));
  })
);

app.post(
  '/api/projects',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, subtitle, year, link, mediaType, mediaPath } = req.body;
    const id = await nextId('project');
    await Project.create({ id, title, subtitle, year, link, mediaType, mediaPath });
    res.json({ id, title, subtitle, year, link, mediaType, mediaPath });
  })
);

app.delete(
  '/api/projects/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(String(req.params.id), 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    const result = await Project.findOneAndDelete({ id });
    if (!result) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true });
  })
);

app.put(
  '/api/projects/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(String(req.params.id), 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    const { title, subtitle, year, link, mediaType, mediaPath } = req.body;
    const result = await Project.findOneAndUpdate(
      { id },
      { $set: { title, subtitle, year, link, mediaType, mediaPath } }
    );
    if (!result) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true });
  })
);

// --- Contact / Messages ---
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post(
  '/api/contact',
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim();
    const message = String(req.body?.message ?? '').trim();
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    if (!EMAIL_FORMAT.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address (e.g. name@example.com).' });
    }
    if (name.length > 200) {
      return res.status(400).json({ error: 'Name is too long.' });
    }
    if (message.length > 20000) {
      return res.status(400).json({ error: 'Message is too long (max 20,000 characters).' });
    }
    const date = new Date().toISOString();
    const mid = await nextId('message');
    await Message.create({ id: mid, name, email, message, date, is_read: 0 });
    res.json({ success: true });
  })
);

app.get(
  '/api/messages',
  authenticate,
  asyncHandler(async (req, res) => {
    const messages = await Message.find().sort({ id: -1 });
    res.json(messages.map((m) => m.toJSON()));
  })
);

app.put(
  '/api/messages/mark-read',
  authenticate,
  asyncHandler(async (req, res) => {
    await Message.updateMany({ is_read: 0 }, { $set: { is_read: 1 } });
    res.json({ success: true });
  })
);

app.delete(
  '/api/messages/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(String(req.params.id), 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid message id' });
    }
    const result = await Message.findOneAndDelete({ id });
    if (!result) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true });
  })
);

// --- Testimonials ---
app.get(
  '/api/testimonials',
  asyncHandler(async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const testimonials = await Testimonial.find().sort({ id: 1 });
    res.json(testimonials.map((t) => t.toJSON()));
  })
);

app.post(
  '/api/testimonials',
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, role, location, image, quote, tag } = req.body;
    const tid = await nextId('testimonial');
    await Testimonial.create({ id: tid, name, role, location, image, quote, tag });
    res.json({ id: tid, name, role, location, image, quote, tag });
  })
);

app.put(
  '/api/testimonials/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, role, location, image, quote, tag } = req.body;
    const tid = Number.parseInt(String(req.params.id), 10);
    await Testimonial.updateOne(
      { id: tid },
      { $set: { name, role, location, image, quote, tag } }
    );
    res.json({ success: true });
  })
);

app.delete(
  '/api/testimonials/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const tid = Number.parseInt(String(req.params.id), 10);
    await Testimonial.deleteOne({ id: tid });
    res.json({ success: true });
  })
);

// --- Admin image upload: Cloudinary (HTTPS URL in DB) or local /assets ---
app.post(
  '/api/upload',
  authenticate,
  uploadImage.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (isCloudinaryConfigured()) {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'portfolio',
        resource_type: 'image',
      });
      return res.json({ path: result.secure_url, filename: result.public_id });
    }
    res.json({ path: `/assets/${req.file.filename}`, filename: req.file.filename });
  })
);

// --- Settings ---
app.get(
  '/api/settings/resume',
  asyncHandler(async (req, res) => {
    const setting = await Setting.findOne({ key: 'resume_url' }).lean();
    res.json({ value: setting ? setting.value : '/Serge_Ishimwe_Resume.pdf' });
  })
);

app.put(
  '/api/settings/resume',
  authenticate,
  asyncHandler(async (req, res) => {
    const { value } = req.body;
    if (!value) return res.status(400).json({ error: 'Value is required' });

    await Setting.findOneAndUpdate(
      { key: 'resume_url' },
      { $set: { value } },
      { upsert: true, new: true }
    );
    res.json({ success: true, value });
  })
);

// SPA fallback: non-API routes serve the React app (react-router handles the path)
app.use((req, res) => {
  const indexHtml = path.join(__dirname, 'dist', 'index.html');
  if (!req.path.startsWith('/api') && fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.status(404).json({
    error: 'not_found',
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'SERVERLESS_DB_REQUIRED' || err.code === 'MONGODB_URI_MISSING') {
    return res.status(503).json({
      error: 'database_not_configured',
      code: err.code,
      message: err.message,
    });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'file_too_large', message: 'Image must be 8MB or smaller' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: 'upload_error', message: err.message || 'Upload failed' });
  }
  const msg = err.message || '';
  if (/Only JPEG|image|multer/i.test(msg) && msg.length < 200) {
    return res.status(400).json({ error: 'invalid_file', message: msg });
  }
  res.status(500).json({ error: 'server_error', message: err.message || 'internal' });
});

async function startServer() {
  await ensureDb();
  // Render requires listening on 0.0.0.0 so public traffic reaches the process
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);

    const base = process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, '');
    const pingUrl = base ? `${base}/api/health` : null;
    if (pingUrl) {
      const pingHealth = () => {
        const req = https.get(pingUrl, (res) => {
          res.on('error', (err) => {
            console.warn('[health-ping] response', err.message);
          });
          res.resume();
        });
        req.on('error', (err) => {
          console.warn('[health-ping]', err.message);
        });
        req.setTimeout(15000, () => {
          req.destroy();
        });
      };
      setInterval(pingHealth, 14 * 60 * 1000);
    }
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = { app };