const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function update() {
  const db = await open({
    filename: path.join(__dirname, 'portfolio.db'),
    driver: sqlite3.Database
  });

  await db.run(
    "UPDATE testimonials SET role = ?, location = ? WHERE name = 'Emery Murenzi'",
    ['CTO, Norf Cre8tions', 'Musanze, Rwanda']
  );

  await db.run(
    "UPDATE testimonials SET role = ?, location = ? WHERE name = 'Kwizera Eric'",
    ['Software Developer, Norf Cre8tions', 'Musanze, Rwanda']
  );

  console.log('Testimonials updated successfully');
}

update().catch(console.error);
