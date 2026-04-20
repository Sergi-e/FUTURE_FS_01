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
const { setupDatabase, isLibsqlConfigured } = require('./database');

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(
  cors({
    origin: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/** Needed for Vercel serverless: DB init before route handlers run (no prior `app.listen`). */
async function ensureDb() {
  if (!db) {
    db = await setupDatabase();
  }
}

app.use(async (req, res, next) => {
  try {
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
  const libsqlConfigured = isLibsqlConfigured();
  const cloudinaryConfigured = isCloudinaryConfigured();
  const dbPathConfigured = Boolean(process.env.PORTFOLIO_DB_PATH);
  const uploadsDirConfigured = Boolean(process.env.PORTFOLIO_UPLOADS_DIR);
  const dbPersistent = libsqlConfigured || dbPathConfigured;
  const uploadsPersistent = cloudinaryConfigured || uploadsDirConfigured;
  const onPaaS =
    process.env.RENDER === 'true' ||
    process.env.RENDER === '1' ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    Boolean(process.env.FLY_APP_NAME) ||
    Boolean(process.env.DYNO);
  let ephemeralWarning;
  if (onPaaS && (!dbPersistent || !uploadsPersistent)) {
    const parts = [];
    if (!dbPersistent) {
      parts.push(
        'Database is ephemeral. Set LIBSQL_URL + LIBSQL_AUTH_TOKEN (Turso), or mount a disk and set PORTFOLIO_DB_PATH.'
      );
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
      libsqlConfigured,
      cloudinaryConfigured,
      dbPathConfigured,
      uploadsDirConfigured,
      dbPersistent,
      uploadsPersistent,
      ...(ephemeralWarning ? { ephemeralWarning } : {}),
    },
    /** @deprecated use storage.dbPathConfigured */
    db: {
      persistentPathConfigured: dbPathConfigured,
      ...(ephemeralWarning ? { ephemeralWarning } : {}),
    },
  });
});

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

let db;

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
    const admin = await db.get('SELECT * FROM admin WHERE username = ?', [username]);

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
    const row = await db.get('SELECT id, username FROM admin WHERE id = ?', [req.user.id]);
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
    const admin = await db.get('SELECT * FROM admin WHERE id = ?', [req.user.id]);
    if (!admin) return res.status(404).json({ error: 'Account not found' });
    if (!(await bcrypt.compare(currentPassword, admin.password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    await db.run('UPDATE admin SET password = ? WHERE id = ?', [hash, req.user.id]);
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
    const admin = await db.get('SELECT * FROM admin WHERE id = ?', [req.user.id]);
    if (!admin) return res.status(404).json({ error: 'Account not found' });
    if (!(await bcrypt.compare(currentPassword, admin.password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const taken = await db.get('SELECT id FROM admin WHERE username = ? AND id != ?', [name, req.user.id]);
    if (taken) return res.status(409).json({ error: 'That username is already in use' });
    await db.run('UPDATE admin SET username = ? WHERE id = ?', [name, req.user.id]);
    const token = jwt.sign({ id: admin.id, username: name }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token, username: name });
  })
);

// --- Projects ---
app.get(
  '/api/projects',
  asyncHandler(async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const projects = await db.all('SELECT * FROM projects ORDER BY id DESC');
    res.json(projects);
  })
);

app.post(
  '/api/projects',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, subtitle, year, link, mediaType, mediaPath } = req.body;
    const result = await db.run(
      'INSERT INTO projects (title, subtitle, year, link, mediaType, mediaPath) VALUES (?, ?, ?, ?, ?, ?)',
      [title, subtitle, year, link, mediaType, mediaPath]
    );
    res.json({ id: result.lastID, title, subtitle, year, link, mediaType, mediaPath });
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
    const result = await db.run('DELETE FROM projects WHERE id = ?', [id]);
    if (!result.changes) {
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
    const result = await db.run(
      'UPDATE projects SET title = ?, subtitle = ?, year = ?, link = ?, mediaType = ?, mediaPath = ? WHERE id = ?',
      [title, subtitle, year, link, mediaType, mediaPath, id]
    );
    if (!result.changes) {
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
    await db.run(
      'INSERT INTO messages (name, email, message, date, is_read) VALUES (?, ?, ?, ?, 0)',
      [name, email, message, date]
    );
    res.json({ success: true });
  })
);

app.get(
  '/api/messages',
  authenticate,
  asyncHandler(async (req, res) => {
    const messages = await db.all('SELECT * FROM messages ORDER BY id DESC');
    res.json(messages);
  })
);

app.put(
  '/api/messages/mark-read',
  authenticate,
  asyncHandler(async (req, res) => {
    await db.run('UPDATE messages SET is_read = 1 WHERE is_read = 0');
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
    const result = await db.run('DELETE FROM messages WHERE id = ?', [id]);
    if (!result.changes) {
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
    const testimonials = await db.all('SELECT * FROM testimonials ORDER BY id ASC');
    res.json(testimonials);
  })
);

app.post(
  '/api/testimonials',
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, role, location, image, quote, tag } = req.body;
    const result = await db.run(
      'INSERT INTO testimonials (name, role, location, image, quote, tag) VALUES (?, ?, ?, ?, ?, ?)',
      [name, role, location, image, quote, tag]
    );
    res.json({ id: result.lastID, name, role, location, image, quote, tag });
  })
);

app.put(
  '/api/testimonials/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, role, location, image, quote, tag } = req.body;
    await db.run(
      'UPDATE testimonials SET name = ?, role = ?, location = ?, image = ?, quote = ?, tag = ? WHERE id = ?',
      [name, role, location, image, quote, tag, req.params.id]
    );
    res.json({ success: true });
  })
);

app.delete(
  '/api/testimonials/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await db.run('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
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
    const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['resume_url']);
    res.json({ value: setting ? setting.value : '/Serge_Ishimwe_Resume.pdf' });
  })
);

app.put(
  '/api/settings/resume',
  authenticate,
  asyncHandler(async (req, res) => {
    const { value } = req.body;
    if (!value) return res.status(400).json({ error: 'Value is required' });

    await db.run(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      ['resume_url', value]
    );
    res.json({ success: true, value });
  })
);

app.use((req, res) => {
  res.status(404).json({
    error: 'not_found',
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
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