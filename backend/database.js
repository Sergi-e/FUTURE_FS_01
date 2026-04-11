const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

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

/**
 * Ensures the two real portfolio testimonials (Emely Murenzi, Eric Kwizera) and their photo paths.
 * If the DB already has exactly those two image paths, only normalizes name/role/quote/tag.
 * Otherwise replaces rows when there are at most six (templates / experiments), so a bad seed
 * self-heals on the next API start. Skips if you have more than six rows (treat as custom data).
 */
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

/** One promise: open DB + schema + seeds. Avoids returning `open()` early while init is still running. */
let initPromise = null;

async function setupDatabase() {
  if (!initPromise) {
    const dbFile =
      process.env.PORTFOLIO_DB_PATH || path.join(__dirname, 'portfolio.db');

    initPromise = (async () => {
      const db = await open({
        filename: dbFile,
        driver: sqlite3.Database
      });

      // Create tables
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

      // Seed admin user if not exists (password: admin123)
      const admin = await db.get('SELECT * FROM admin WHERE username = ?', ['admin']);
      if (!admin) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        await db.run('INSERT INTO admin (username, password) VALUES (?, ?)', ['admin', hash]);
      }

      // Seed sample project if empty
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

      // Emely Murenzi + Eric Kwizera (Norf Cre8tions) — canonical copy + photo paths
      await seedNorfCreationsTestimonials(db);

      // Seed settings if empty
      const setting = await db.get('SELECT * FROM settings WHERE key = ?', ['resume_url']);
      if (!setting) {
        await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['resume_url', '/Serge_Ishimwe_Resume.pdf']);
      }

      return db;
    })();
  }

  return initPromise;
}

module.exports = { setupDatabase };