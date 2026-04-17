const path = require('path');
const { openDatabase } = require('./database');

async function update() {
  const db = openDatabase(path.join(__dirname, 'portfolio.db'));

  await db.run(
    "UPDATE testimonials SET location = 'Kigali, Rwanda' WHERE name = 'Kwizera Eric'"
  );
  console.log('Location updated to Kigali, Rwanda');
}
update().catch(console.error);
