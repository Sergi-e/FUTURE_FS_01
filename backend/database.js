const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

function isLibsqlConfigured() {
  return Boolean(
    String(process.env.LIBSQL_URL || '').trim() && String(process.env.LIBSQL_AUTH_TOKEN || '').trim()
  );
}

function isVercelServerless() {
  return process.env.VERCEL === '1' || process.env.VERCEL === 'true';
}

/**
 * SQLite via sql.js (WASM) — local file; no native addons.
 * Or Turso (@libsql/client) when LIBSQL_URL + LIBSQL_AUTH_TOKEN are set (persistent on free Render).
 */
let sqlJsFactory = null;

async function getSQL() {
  if (!sqlJsFactory) {
    const initSqlJs = require('sql.js');
    const wasmDir = path.join(__dirname, 'node_modules', 'sql.js', 'dist');
    sqlJsFactory = await initSqlJs({
      locateFile: (file) => path.join(wasmDir, file),
    });
  }
  return sqlJsFactory;
}

function wrapSqlJsDatabase(db, dbFile) {
  function persist() {
    if (!dbFile) return;
    const dir = path.dirname(dbFile);
    if (dir && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = db.export();
    fs.writeFileSync(dbFile, Buffer.from(data));
  }

  return {
    async exec(sql) {
      db.exec(sql);
      persist();
    },
    async get(sql, params = []) {
      const stmt = db.prepare(sql);
      try {
        if (params.length) stmt.bind(params);
        if (stmt.step()) {
          return stmt.getAsObject();
        }
        return undefined;
      } finally {
        stmt.free();
      }
    },
    async all(sql, params = []) {
      const stmt = db.prepare(sql);
      try {
        if (params.length) stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        return rows;
      } finally {
        stmt.free();
      }
    },
    async run(sql, params = []) {
      if (params && params.length) {
        db.run(sql, params);
      } else {
        db.run(sql);
      }
      const changes = db.getRowsModified();
      let lastID = 0;
      const lidStmt = db.prepare('SELECT last_insert_rowid() AS lid');
      try {
        if (lidStmt.step()) {
          lastID = Number(lidStmt.getAsObject().lid) || 0;
        }
      } finally {
        lidStmt.free();
      }
      persist();
      return { lastID, changes };
    },
    async close() {
      try {
        persist();
      } finally {
        db.close();
      }
    },
  };
}

function libsqlRowToObject(row, columns) {
  const o = {};
  for (const c of columns) {
    let v = row[c];
    if (typeof v === 'bigint') v = Number(v);
    o[c] = v;
  }
  return o;
}

function wrapLibsqlClient(client) {
  return {
    async exec(sql) {
      await client.executeMultiple(sql);
    },
    async get(sql, params = []) {
      const rs = await (params.length
        ? client.execute({ sql, args: params })
        : client.execute(sql));
      if (!rs.rows.length) return undefined;
      return libsqlRowToObject(rs.rows[0], rs.columns);
    },
    async all(sql, params = []) {
      const rs = await (params.length
        ? client.execute({ sql, args: params })
        : client.execute(sql));
      return rs.rows.map((row) => libsqlRowToObject(row, rs.columns));
    },
    async run(sql, params = []) {
      const rs = await (params.length
        ? client.execute({ sql, args: params })
        : client.execute(sql));
      return {
        lastID: Number(rs.lastInsertRowid ?? 0),
        changes: rs.rowsAffected,
      };
    },
    async close() {
      await client.close();
    },
  };
}

async function openDatabase(filename) {
  const SQL = await getSQL();
  let raw;
  if (fs.existsSync(filename)) {
    raw = new SQL.Database(fs.readFileSync(filename));
  } else {
    raw = new SQL.Database();
  }
  console.log(`[portfolio-db] ${filename}`);
  return wrapSqlJsDatabase(raw, filename);
}

/** Norf Cre8tions — restored from removed `backend/seed_testimonials.js` (commit 4dfb9a3). */
const TESTIMONIAL_EMELY_MURENZI = {
  name: 'Emely Murenzi',
  role: 'Chief Technology Officer (CTO)',
  location: 'Norf Cre8tions',
  image: '/assets/Emery-prof-2-min.jpg.jpeg',
  quote:
    'Serge is a highly reliable and driven contributor on our team. He approached problems with clarity, delivered clean and scalable solutions, and consistently met expectations while maintaining strong collaboration across the team.',
  tag: 'IMG_ID: 04',
};

const TESTIMONIAL_ERIC_KWIZERA = {
  name: 'Eric Kwizera',
  role: 'Software Developer',
  location: 'Norf Cre8tions',
  image: '/assets/Wizzy.jpeg',
  quote:
    'Working alongside Serge consistently improved the quality and speed of our delivery. He communicates clearly, writes clean and scalable code, and approaches problems with a strong focus on practical, client-ready solutions that perform reliably in real-world use.',
  tag: 'IMG_ID: 05',
};

async function seedNorfCreationsTestimonials(db) {
  const rows = await db.all('SELECT * FROM testimonials ORDER BY id ASC');
  const images = new Set(rows.map((r) => String(r.image || '').trim()));

  const hasEmelyPhoto = images.has(TESTIMONIAL_EMELY_MURENZI.image);
  const hasEricPhoto = images.has(TESTIMONIAL_ERIC_KWIZERA.image);

  if (rows.length === 2 && hasEmelyPhoto && hasEricPhoto) {
    await db.run(
      'UPDATE testimonials SET name = ?, role = ?, location = ?, quote = ?, tag = ? WHERE image = ?',
      [
        TESTIMONIAL_EMELY_MURENZI.name,
        TESTIMONIAL_EMELY_MURENZI.role,
        TESTIMONIAL_EMELY_MURENZI.location,
        TESTIMONIAL_EMELY_MURENZI.quote,
        TESTIMONIAL_EMELY_MURENZI.tag,
        TESTIMONIAL_EMELY_MURENZI.image,
      ]
    );
    await db.run(
      'UPDATE testimonials SET name = ?, role = ?, location = ?, quote = ?, tag = ? WHERE image = ?',
      [
        TESTIMONIAL_ERIC_KWIZERA.name,
        TESTIMONIAL_ERIC_KWIZERA.role,
        TESTIMONIAL_ERIC_KWIZERA.location,
        TESTIMONIAL_ERIC_KWIZERA.quote,
        TESTIMONIAL_ERIC_KWIZERA.tag,
        TESTIMONIAL_ERIC_KWIZERA.image,
      ]
    );
    return;
  }

  if (rows.length > 6) return;

  await db.run('DELETE FROM testimonials');

  await db.run(
    'INSERT INTO testimonials (name, role, location, image, quote, tag) VALUES (?, ?, ?, ?, ?, ?)',
    [
      TESTIMONIAL_EMELY_MURENZI.name,
      TESTIMONIAL_EMELY_MURENZI.role,
      TESTIMONIAL_EMELY_MURENZI.location,
      TESTIMONIAL_EMELY_MURENZI.image,
      TESTIMONIAL_EMELY_MURENZI.quote,
      TESTIMONIAL_EMELY_MURENZI.tag,
    ]
  );
  await db.run(
    'INSERT INTO testimonials (name, role, location, image, quote, tag) VALUES (?, ?, ?, ?, ?, ?)',
    [
      TESTIMONIAL_ERIC_KWIZERA.name,
      TESTIMONIAL_ERIC_KWIZERA.role,
      TESTIMONIAL_ERIC_KWIZERA.location,
      TESTIMONIAL_ERIC_KWIZERA.image,
      TESTIMONIAL_ERIC_KWIZERA.quote,
      TESTIMONIAL_ERIC_KWIZERA.tag,
    ]
  );
}

async function migrateAndSeed(db) {
  await db.exec(`
        CREATE TABLE IF NOT EXISTS admin (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password TEXT
        );
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          subtitle TEXT,
          year TEXT,
          link TEXT,
          mediaType TEXT,
          mediaPath TEXT
        );
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT,
          message TEXT,
          date TEXT
        );
        CREATE TABLE IF NOT EXISTS testimonials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          role TEXT,
          location TEXT,
          image TEXT,
          quote TEXT,
          tag TEXT
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
      `);

  const msgCols = await db.all(`PRAGMA table_info(messages)`);
  if (!msgCols.some((c) => c.name === 'is_read')) {
    await db.run(`ALTER TABLE messages ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0`);
    await db.run(`UPDATE messages SET is_read = 1`);
  }

  const admin = await db.get('SELECT * FROM admin WHERE username = ?', ['admin']);
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    await db.run('INSERT INTO admin (username, password) VALUES (?, ?)', ['admin', hash]);
  }

  const project = await db.get('SELECT * FROM projects');
  if (!project) {
    await db.run(
      'INSERT INTO projects (title, subtitle, year, link, mediaType, mediaPath) VALUES (?, ?, ?, ?, ?, ?)',
      ['CLIMATE CHANGE IMPACT', 'Marine Life Monitoring & Data Visualization via ArcGIS', '2025', 'https://arcg.is/09v5GS1', 'video', '/assets/kivu.mp4']
    );
    await db.run(
      'INSERT INTO projects (title, subtitle, year, link, mediaType, mediaPath) VALUES (?, ?, ?, ?, ?, ?)',
      ['BE THE LIGHT WEBSITE', 'Impactful Community Hub built with Lovable', '2025', 'https://bethe-light-hub.lovable.app/', 'image', '/assets/bethelight.png']
    );
  }

  await seedNorfCreationsTestimonials(db);

  const setting = await db.get('SELECT * FROM settings WHERE key = ?', ['resume_url']);
  if (!setting) {
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['resume_url', '/Serge_Ishimwe_Resume.pdf']);
  }

  return db;
}

let initPromise = null;

async function setupDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      /** sql.js cold init often exceeds Vercel Hobby's ~10s function limit — Turso (libsql) is required. */
      if (isVercelServerless() && !isLibsqlConfigured()) {
        const err = new Error(
          'Set LIBSQL_URL and LIBSQL_AUTH_TOKEN (Turso) in Vercel → Environment Variables (Production). File-based SQLite via sql.js is not viable on Vercel serverless.'
        );
        err.code = 'SERVERLESS_SQLITE_UNSUPPORTED';
        throw err;
      }
      if (isLibsqlConfigured()) {
        const { createClient } = require('@libsql/client');
        const client = createClient({
          url: String(process.env.LIBSQL_URL).trim(),
          authToken: String(process.env.LIBSQL_AUTH_TOKEN).trim(),
        });
        const db = wrapLibsqlClient(client);
        console.log('[portfolio-db] libsql (Turso)');
        await migrateAndSeed(db);
        return db;
      }

      const dbFile = process.env.PORTFOLIO_DB_PATH || path.join(__dirname, 'portfolio.db');
      const SQL = await getSQL();
      let raw;
      if (fs.existsSync(dbFile)) {
        raw = new SQL.Database(fs.readFileSync(dbFile));
      } else {
        raw = new SQL.Database();
      }
      const db = wrapSqlJsDatabase(raw, dbFile);
      console.log(`[portfolio-db] ${dbFile}`);
      await migrateAndSeed(db);
      return db;
    })();
  }

  return initPromise;
}

module.exports = { setupDatabase, openDatabase, isLibsqlConfigured };
