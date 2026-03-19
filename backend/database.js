const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let dbPromise = null;

async function setupDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = open({
    filename: path.join(__dirname, 'portfolio.db'),
    driver: sqlite3.Database
  });

  const db = await dbPromise;

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

  return db;
}

module.exports = { setupDatabase };
