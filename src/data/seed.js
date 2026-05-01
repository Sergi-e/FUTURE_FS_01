/**
 * Fallback data baked into the build.
 * Components use this as the initial state so visitors see content instantly —
 * no waiting for the API or MongoDB cold start.
 * The API response silently replaces this when it arrives.
 */

export const SEED_PROJECTS = [
  {
    id: 2,
    title: 'BE THE LIGHT WEBSITE',
    subtitle:
      'A community platform built for Be The Light, a grassroots organization dedicated to supporting families in hardship and empowering youth across Rwanda. The site brings together the organization\'s story, mission, goals, and member community in one place, with a blog and a call to action for people to get involved. Built with a warm, purpose-driven design that reflects the heart of the movement.',
    year: '2025',
    link: 'https://bethe-light-hub.lovable.app/',
    mediaType: 'image',
    mediaPath: '/assets/bethelight.png',
  },
  {
    id: 1,
    title: 'CLIMATE CHANGE IMPACT',
    subtitle:
      'A 2025 field research project on marine ecosystems. I monitored biodiversity, collected environmental data, and used ArcGIS for spatial analysis and mapping, turning raw field observations into clear data visualizations. Where conservation meets code.',
    year: '2025',
    link: 'https://arcg.is/09v5GS1',
    mediaType: 'video',
    mediaPath: '/assets/kivu.mp4',
  },
];

export const SEED_TESTIMONIALS = [
  {
    id: 1,
    name: 'Emely Murenzi',
    role: 'Chief Technology Officer (CTO)',
    location: 'Musanze, Rwanda',
    image: '/assets/Emery-prof-2-min.jpg.jpeg',
    quote:
      'Serge is a highly reliable and driven contributor on our team. He approached problems with clarity, delivered clean and scalable solutions, and consistently met expectations while maintaining strong collaboration across the team.',
    tag: 'Norf Cre8tions',
  },
  {
    id: 2,
    name: 'Eric Kwizera',
    role: 'Software Developer',
    location: 'Kigali, Rwanda',
    image: '/assets/Wizzy.jpeg',
    quote:
      'Working alongside Serge consistently improved the quality and speed of our delivery. He communicates clearly, writes clean and scalable code, and approaches problems with a strong focus on practical, client-ready solutions that perform reliably in real-world use.',
    tag: 'Norf Cre8tions',
  },
];
