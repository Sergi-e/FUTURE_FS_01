# Serge Ishimwe — Portfolio

A full-stack personal portfolio built to present my work, skills, and story in one smooth, scroll-driven experience. The frontend is powered by React and Vite with GSAP and Lenis for motion. The backend is a serverless Node.js API deployed on Vercel, backed by MongoDB Atlas, with Cloudinary for persistent image storage and an admin dashboard for full content management.

**Live site:** [serge-portifolio.vercel.app](https://serge-portifolio.vercel.app)

---

## Tech Stack

| Area | Technologies |
|------|--------------|
| Frontend | React 19, Vite 7, CSS (component-scoped) |
| Motion | GSAP 3, ScrollTrigger, Lenis |
| Routing | React Router 7 |
| Backend | Node.js 20, Vercel Serverless Functions |
| Database | MongoDB Atlas (Mongoose) |
| Image storage | Cloudinary |
| Auth | JWT, bcryptjs |
| Deployment | Vercel (frontend + API in one project) |
| CI | GitHub Actions (lint + build on push) |

---

## Features

- Scroll-driven single-page layout: Hero, Approach, Skills, Projects, Testimonials, Hobbies, Contact
- Pinned scroll animations and scrubbed GSAP sequences powered by Lenis + ScrollTrigger
- React Router for `/admin` dashboard
- Admin dashboard: add / edit / delete projects and testimonials, view contact messages, update resume link, change credentials
- Image uploads stored permanently on Cloudinary CDN
- Seed data baked into the frontend build so visitors see content instantly even on API cold starts
- GitHub Actions CI — lint and build checks on every push to `main`

---

## Repository Layout

```
portfolio-2026/
├── api/
│   └── index.js          # Vercel serverless function — all API routes
├── src/
│   ├── components/        # Page sections + AdminDashboard
│   ├── config/            # API base URL (Vite env-aware)
│   ├── data/seed.js       # Fallback data baked into the build
│   ├── lib/               # resolveMediaUrl, apiClient helpers
│   ├── App.jsx
│   └── main.jsx
├── public/                # Static assets (resume PDF, images)
├── backend/               # Express app (local dev server only)
├── .github/workflows/     # CI workflow
├── vercel.json            # Vercel rewrites + function config
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
npm install
npm run dev
```

This starts both the Vite dev server (port 5173) and the local Express API (port 5000) concurrently. The Vite dev server proxies `/api/*` requests to `http://localhost:5000`.

### Environment variables (local)

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<your-secret>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
```

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend together |
| `npm run dev:web` | Frontend only (Vite, port 5173) |
| `npm run dev:api` | Backend only (Express, port 5000) |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

---

## Deployment (Vercel)

The entire project (frontend + API) is deployed as a single Vercel project.

### Required environment variables on Vercel

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string (`mongodb+srv://...`) |
| `JWT_SECRET` | Secret for signing admin JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Set these under **Project Settings → Environment Variables** for the **Production** environment.

### How it works

- `vercel.json` rewrites `/api/*` to `api/index.js` (serverless function) and all other routes to `index.html` (SPA fallback)
- The serverless function handles all CRUD operations directly using Mongoose — no Express layer in production
- MongoDB Atlas IP access list should include `0.0.0.0/0` since Vercel uses dynamic IPs

### After deploy

- Portfolio: `https://serge-portifolio.vercel.app`
- Admin: `https://serge-portifolio.vercel.app/admin`
- Default credentials: `admin` / `admin123` — **change the password immediately after first login**

---

## API Endpoints

All endpoints are under `/api`:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/login` | — | Admin login → JWT |
| GET | `/auth/me` | ✓ | Current admin info |
| PUT | `/auth/password` | ✓ | Change password |
| PUT | `/auth/username` | ✓ | Change username |
| GET | `/projects` | — | List projects |
| POST | `/projects` | ✓ | Create project |
| PUT | `/projects/:id` | ✓ | Update project |
| DELETE | `/projects/:id` | ✓ | Delete project |
| GET | `/testimonials` | — | List testimonials |
| POST | `/testimonials` | ✓ | Create testimonial |
| PUT | `/testimonials/:id` | ✓ | Update testimonial |
| DELETE | `/testimonials/:id` | ✓ | Delete testimonial |
| POST | `/contact` | — | Submit contact message |
| GET | `/messages` | ✓ | List messages |
| PUT | `/messages/mark-read` | ✓ | Mark all messages read |
| DELETE | `/messages/:id` | ✓ | Delete message |
| POST | `/upload` | ✓ | Upload image to Cloudinary |
| GET | `/settings/resume` | — | Get resume URL |
| PUT | `/settings/resume` | ✓ | Update resume URL |

---

## Author

**Serge Ishimwe** — Full-stack developer and aspiring AI/ML engineer.

---

## License

Private / personal project.
