if (!process.env.VERCEL) {
  require('dotenv').config();
}
const { setupDatabase, Testimonial } = require('./database');

async function update() {
  await setupDatabase();

  await Testimonial.updateMany(
    { name: 'Emery Murenzi' },
    { $set: { role: 'CTO, Norf Cre8tions', location: 'Musanze, Rwanda' } }
  );

  await Testimonial.updateMany(
    { name: 'Kwizera Eric' },
    { $set: { role: 'Software Developer, Norf Cre8tions', location: 'Musanze, Rwanda' } }
  );

  console.log('Testimonials updated successfully');
}

update().catch(console.error);
