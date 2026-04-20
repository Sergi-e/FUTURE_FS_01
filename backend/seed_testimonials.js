if (!process.env.VERCEL) {
  require('dotenv').config();
}
const { setupDatabase, Testimonial, nextId } = require('./database');

async function seed() {
  await setupDatabase();

  const emery = {
    name: 'Emery Murenzi',
    role: 'Chief Technology Officer (CTO)',
    location: 'Norf Cre8tions',
    image: '/assets/Emery-prof-2-min.jpg.jpeg',
    quote:
      'Serge is a highly reliable and driven contributor on our team. He approached problems with clarity, delivered clean and scalable solutions, and consistently met expectations while maintaining strong collaboration across the team.',
    tag: 'IMG_ID: 04',
  };

  const eric = {
    name: 'Kwizera Eric',
    role: 'Software Developer',
    location: 'Norf Cre8tions',
    image: '/assets/Wizzy.jpeg',
    quote:
      'Working alongside Serge consistently improved the quality and speed of our delivery. He communicates clearly, writes clean and scalable code, and approaches problems with a strong focus on practical, client-ready solutions that perform reliably in real-world use.',
    tag: 'IMG_ID: 05',
  };

  const id1 = await nextId('testimonial');
  const id2 = await nextId('testimonial');
  await Testimonial.create({ id: id1, ...emery });
  await Testimonial.create({ id: id2, ...eric });

  console.log('Testimonials seeded successfully');
}

seed().catch(console.error);
