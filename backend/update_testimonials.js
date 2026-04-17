const path = require('path');
const { openDatabase } = require('./database');

async function update() {
  const db = openDatabase(path.join(__dirname, 'portfolio.db'));

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
