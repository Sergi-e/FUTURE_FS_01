const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function seed() {
  const db = await open({
    filename: path.join(__dirname, 'portfolio.db'),
    driver: sqlite3.Database
  });

  const emery = {
    name: 'Emery Murenzi',
    role: 'Chief Technology Officer (CTO)',
    location: 'Norf Cre8tions',
    image: '/assets/Emery-prof-2-min.jpg.jpeg',
    quote: 'Serge is a highly reliable and driven contributor on our team. He approached problems with clarity, delivered clean and scalable solutions, and consistently met expectations while maintaining strong collaboration across the team.',
    tag: 'IMG_ID: 04'
  };

  const eric = {
    name: 'Kwizera Eric',
    role: 'Software Developer',
    location: 'Norf Cre8tions',
    image: '/assets/Wizzy.jpeg',
    quote: 'Working alongside Serge consistently improved the quality and speed of our delivery. He communicates clearly, writes clean and scalable code, and approaches problems with a strong focus on practical, client-ready solutions that perform reliably in real-world use.',
    tag: 'IMG_ID: 05'
  };

  await db.run(
    'INSERT INTO testimonials (name, role, location, image, quote, tag) VALUES (?, ?, ?, ?, ?, ?)',
    [emery.name, emery.role, emery.location, emery.image, emery.quote, emery.tag]
  );

  await db.run(
    'INSERT INTO testimonials (name, role, location, image, quote, tag) VALUES (?, ?, ?, ?, ?, ?)',
    [eric.name, eric.role, eric.location, eric.image, eric.quote, eric.tag]
  );

  console.log('Testimonials seeded successfully');
}

seed().catch(console.error);
