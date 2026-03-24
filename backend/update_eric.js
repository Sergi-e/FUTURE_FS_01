const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function update() {
  const db = await open({
    filename: path.join(__dirname, 'portfolio.db'),
    driver: sqlite3.Database
  });

  await db.run(
    "UPDATE testimonials SET location = 'Kigali, Rwanda' WHERE name = 'Kwizera Eric'"
  );
  console.log('Location updated to Kigali, Rwanda');
}
update().catch(console.error);
