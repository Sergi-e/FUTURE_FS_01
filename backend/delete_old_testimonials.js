const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function clean() {
  const db = await open({
    filename: path.join(__dirname, 'portfolio.db'),
    driver: sqlite3.Database
  });

  await db.run("DELETE FROM testimonials WHERE name NOT IN ('Emery Murenzi', 'Kwizera Eric')");
  console.log('Old testimonials deleted successfully');
}

clean().catch(console.error);
