require('dotenv').config();
const https = require('https');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { setupDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
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
  res.status(200).json({ ok: true });
});

// Project/testimonial media paths in the DB are like /assets/foo.png — serve them here
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

let db;

/** Route async errors -> Express error middleware (avoids unhandled rejections). */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Basic auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
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

// --- Projects ---
app.get(
  '/api/projects',
  asyncHandler(async (req, res) => {
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
    await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  })
);

app.put(
  '/api/projects/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, subtitle, year, link, mediaType, mediaPath } = req.body;
    await db.run(
      'UPDATE projects SET title = ?, subtitle = ?, year = ?, link = ?, mediaType = ?, mediaPath = ? WHERE id = ?',
      [title, subtitle, year, link, mediaType, mediaPath, req.params.id]
    );
    res.json({ success: true });
  })
);

// --- Contact / Messages ---
app.post(
  '/api/contact',
  asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;
    const date = new Date().toISOString();
    await db.run(
      'INSERT INTO messages (name, email, message, date) VALUES (?, ?, ?, ?)',
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

app.delete(
  '/api/messages/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await db.run('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  })
);

// --- Testimonials ---
app.get(
  '/api/testimonials',
  asyncHandler(async (req, res) => {
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

app.delete(
  '/api/testimonials/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await db.run('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true });
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
  res.status(500).json({ error: 'server_error', message: err.message || 'internal' });
});

async function startServer() {
  db = await setupDatabase();
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

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});