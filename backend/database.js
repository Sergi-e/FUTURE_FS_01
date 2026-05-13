const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

function isMongoConfigured() {
  return Boolean(String(process.env.MONGODB_URI || '').trim());
}

function isVercelServerless() {
  return process.env.VERCEL === '1' || process.env.VERCEL === 'true';
}

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const adminSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
adminSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

const projectSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true, required: true },
  title: String,
  subtitle: String,
  year: String,
  link: String,
  mediaType: String,
  mediaPath: String,
});
projectSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

const messageSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true, required: true },
  name: String,
  email: String,
  message: String,
  date: String,
  is_read: { type: Number, default: 0 },
});
messageSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

const testimonialSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true, required: true },
  name: String,
  role: String,
  location: String,
  image: String,
  quote: String,
  tag: String,
});
testimonialSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
const Testimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);

const settingSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: String,
});
settingSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

/** @type {{ conn: typeof mongoose | null, promise: Promise<typeof mongoose> | null }} */
let cached = global.__portfolioMongoose;
if (!cached) {
  cached = global.__portfolioMongoose = { conn: null, promise: null };
}

async function connectMongo() {
  const uri = String(process.env.MONGODB_URI || '').trim();
  if (!uri) {
    const err = new Error('Set MONGODB_URI in the environment (MongoDB Atlas connection string).');
    err.code = 'MONGODB_URI_MISSING';
    throw err;
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 25000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

async function nextId(counterName) {
  const r = await Counter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return r.seq;
}

/** Norf Cre8tions — kept in sync with src/data/seed.js and api/index.js seed. */
const TESTIMONIAL_EMELY_MURENZI = {
  name: 'Emely Murenzi',
  role: 'Chief Technology Officer (CTO)',
  location: 'Musanze, Rwanda',
  image: '/assets/Emery-prof-2-min.jpg.jpeg',
  quote:
    'Serge is a highly reliable and driven contributor on our team. He approached problems with clarity, delivered clean and scalable solutions, and consistently met expectations while maintaining strong collaboration across the team.',
  tag: 'Norf Cre8tions',
};

const TESTIMONIAL_ERIC_KWIZERA = {
  name: 'Eric Kwizera',
  role: 'Software Developer',
  location: 'Kigali, Rwanda',
  image: '/assets/Wizzy.jpeg',
  quote:
    'Working alongside Serge consistently improved the quality and speed of our delivery. He communicates clearly, writes clean and scalable code, and approaches problems with a strong focus on practical, client-ready solutions that perform reliably in real-world use.',
  tag: 'Norf Cre8tions',
};

async function seedNorfCreationsTestimonials() {
  const rows = await Testimonial.find().sort({ id: 1 }).lean();
  const images = new Set(rows.map((r) => String(r.image || '').trim()));

  const hasEmelyPhoto = images.has(TESTIMONIAL_EMELY_MURENZI.image);
  const hasEricPhoto = images.has(TESTIMONIAL_ERIC_KWIZERA.image);

  if (rows.length === 2 && hasEmelyPhoto && hasEricPhoto) {
    await Testimonial.updateOne(
      { image: TESTIMONIAL_EMELY_MURENZI.image },
      {
        $set: {
          name: TESTIMONIAL_EMELY_MURENZI.name,
          role: TESTIMONIAL_EMELY_MURENZI.role,
          location: TESTIMONIAL_EMELY_MURENZI.location,
          quote: TESTIMONIAL_EMELY_MURENZI.quote,
          tag: TESTIMONIAL_EMELY_MURENZI.tag,
        },
      }
    );
    await Testimonial.updateOne(
      { image: TESTIMONIAL_ERIC_KWIZERA.image },
      {
        $set: {
          name: TESTIMONIAL_ERIC_KWIZERA.name,
          role: TESTIMONIAL_ERIC_KWIZERA.role,
          location: TESTIMONIAL_ERIC_KWIZERA.location,
          quote: TESTIMONIAL_ERIC_KWIZERA.quote,
          tag: TESTIMONIAL_ERIC_KWIZERA.tag,
        },
      }
    );
    return;
  }

  if (rows.length > 6) return;

  await Testimonial.deleteMany({});

  const id1 = await nextId('testimonial');
  const id2 = await nextId('testimonial');
  await Testimonial.create({
    id: id1,
    name: TESTIMONIAL_EMELY_MURENZI.name,
    role: TESTIMONIAL_EMELY_MURENZI.role,
    location: TESTIMONIAL_EMELY_MURENZI.location,
    image: TESTIMONIAL_EMELY_MURENZI.image,
    quote: TESTIMONIAL_EMELY_MURENZI.quote,
    tag: TESTIMONIAL_EMELY_MURENZI.tag,
  });
  await Testimonial.create({
    id: id2,
    name: TESTIMONIAL_ERIC_KWIZERA.name,
    role: TESTIMONIAL_ERIC_KWIZERA.role,
    location: TESTIMONIAL_ERIC_KWIZERA.location,
    image: TESTIMONIAL_ERIC_KWIZERA.image,
    quote: TESTIMONIAL_ERIC_KWIZERA.quote,
    tag: TESTIMONIAL_ERIC_KWIZERA.tag,
  });
}

async function migrateAndSeed() {
  const admin = await Admin.findOne({ username: 'admin' });
  if (!admin) {
    const id = await nextId('admin');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    await Admin.create({ id, username: 'admin', password: hash });
  }

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    const id1 = await nextId('project');
    const id2 = await nextId('project');
    await Project.create({
      id: id1,
      title: 'CLIMATE CHANGE IMPACT',
      subtitle:
        'A 2025 field research project on Lake Kivu marine ecosystems, using ArcGIS for spatial analysis and interactive mapping. I monitored biodiversity, collected environmental data, and turned raw field observations into clear data visualizations. Published as an ArcGIS StoryMap — where conservation meets code.',
      year: '2025',
      link: 'https://arcg.is/09v5GS1',
      mediaType: 'video',
      mediaPath: '/assets/kivu.mp4',
    });
    await Project.create({
      id: id2,
      title: 'BE THE LIGHT WEBSITE',
      subtitle:
        'A community platform for Be The Light, a grassroots organization supporting families in hardship and empowering youth across Rwanda, built with Lovable. It brings together the organization\'s story, mission, blog, and a community call to action in one place. A warm, purpose-driven design that reflects the heart of the movement.',
      year: '2025',
      link: 'https://bethe-light-hub.lovable.app/',
      mediaType: 'image',
      mediaPath: '/assets/bethelight.png',
    });
  }

  await seedNorfCreationsTestimonials();

  const resume = await Setting.findOne({ key: 'resume_url' });
  if (!resume) {
    await Setting.create({ key: 'resume_url', value: '/Serge_Ishimwe_Resume.pdf' });
  }
}

let initPromise = null;

async function setupDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      if (isVercelServerless() && !isMongoConfigured()) {
        const err = new Error(
          'Set MONGODB_URI (MongoDB Atlas) in Vercel → Environment Variables (Production).'
        );
        err.code = 'SERVERLESS_DB_REQUIRED';
        throw err;
      }
      if (!isMongoConfigured()) {
        const err = new Error('Set MONGODB_URI in the environment for the API to use MongoDB Atlas.');
        err.code = 'MONGODB_URI_MISSING';
        throw err;
      }
      await connectMongo();
      // Run seeding in background so the first request (e.g. login) is not blocked by seed ops
      migrateAndSeed().catch((e) => console.error('[seed]', e.message));
      return true;
    })();
  }
  return initPromise;
}

/**
 * Connects to MongoDB (uses MONGODB_URI). For one-off scripts; same as setupDatabase without re-seeding logic duplication.
 * @deprecated Prefer `setupDatabase()` which runs migrations/seeds once per process.
 */
async function openDatabase() {
  await setupDatabase();
  return mongoose.connection;
}

module.exports = {
  setupDatabase,
  openDatabase,
  isMongoConfigured,
  connectMongo,
  Admin,
  Project,
  Message,
  Testimonial,
  Setting,
  Counter,
  nextId,
};
