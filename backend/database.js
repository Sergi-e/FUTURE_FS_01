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
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role TEXT,
      location TEXT,
      image TEXT,
      quote TEXT,
      tag TEXT
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

  // Seed testimonials if empty
  const testimonial = await db.get('SELECT * FROM testimonials');
  if (!testimonial) {
    await db.run(
      'INSERT INTO testimonials (name, role, location, image, quote, tag) VALUES (?, ?, ?, ?, ?, ?)',
      ['ALEX RIVERA', 'TECH ARCHITECT', 'SAN FRANCISCO, CA', '/assets/testimonial_1.png', 'Serge is a tech enthusiast whose work involves programming and data analysis, turning unstructured, real problems into systems that operate reliably.', 'IMG_ID: 01']
    );
    await db.run(
      'INSERT INTO testimonials (name, role, location, image, quote, tag) VALUES (?, ?, ?, ?, ?, ?)',
      ['SARAH CHEN', 'PROJECT MANAGER', 'LONDON, UK', '/assets/testimonial_2.png', 'Working with Serge was a game-changer. His ability to craft immersive digital experiences while maintaining clean, robust fullstack code is truly exceptional.', 'IMG_ID: 02']
    );
    await db.run(
      'INSERT INTO testimonials (name, role, location, image, quote, tag) VALUES (?, ?, ?, ?, ?, ?)',
      ['DAVID OKORO', 'PRODUCT DESIGNER', 'LAGOS, NIGERIA', '/assets/serge_portrait.png', 'Beyond the screen, Serge is a committed professional dedicated to protecting our environment. His passion for both tech and conservation is inspiring.', 'IMG_ID: 03']
    );
  }

  return db;
}

module.exports = { setupDatabase };
