if (!process.env.VERCEL) {
  require('dotenv').config();
}
const { setupDatabase, Testimonial } = require('./database');

async function clean() {
  await setupDatabase();

  await Testimonial.deleteMany({ name: { $nin: ['Emery Murenzi', 'Kwizera Eric'] } });
  console.log('Old testimonials deleted successfully');
}

clean().catch(console.error);
