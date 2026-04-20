if (!process.env.VERCEL) {
  require('dotenv').config();
}
const { setupDatabase, Testimonial } = require('./database');

async function update() {
  await setupDatabase();

  await Testimonial.updateMany(
    { name: 'Kwizera Eric' },
    { $set: { location: 'Kigali, Rwanda' } }
  );
  console.log('Location updated to Kigali, Rwanda');
}
update().catch(console.error);
