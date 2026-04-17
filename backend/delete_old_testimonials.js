const path = require('path');
const { openDatabase } = require('./database');

async function clean() {
  const db = openDatabase(path.join(__dirname, 'portfolio.db'));

  await db.run("DELETE FROM testimonials WHERE name NOT IN ('Emery Murenzi', 'Kwizera Eric')");
  console.log('Old testimonials deleted successfully');
}

clean().catch(console.error);
