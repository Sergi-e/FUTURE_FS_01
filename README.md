# Serge Ishimwe — Portfolio

Personal portfolio site for **Serge Ishimwe**, a full-stack developer and aspiring AI engineer. The experience highlights approach, skills, featured projects, testimonials, hobbies, and contact—with smooth scrolling, scroll-driven motion, and a themeable accent system.

**Live API (example):** the frontend is built to pair with a small **Express + SQLite** backend for projects, testimonials, contact messages, resume URL, and an admin dashboard.

---

## Features

- **Single-page layout** with hash-friendly sections (Hero, Ethos, Skills, Works, Testimonials, Hobbies, Contact)
- **Lenis** smooth scrolling integrated with **GSAP ScrollTrigger** for pinned sections and scrubbed animations
- **React Router** for `/admin` (dashboard) and redirects from `/login`
- **Theme switcher** (accent colors on `:root`)
- **Responsive layout** with safe-area support for notched devices (`viewport-fit=cover`, `env(safe-area-inset-*)`)
- **Project media** resolved from `public/assets` on the static host (or configurable origin via env)
- **GitHub Actions CI** — `npm ci`, `lint`, and production `build` on push/PR to `main` / `master`

---

## Tech stack

| Area | Technologies |
|------|----------------|
| UI | React 19, Vite 7, CSS (component-scoped stylesheets) |
| Motion | GSAP 3, ScrollTrigger, Lenis |
| Routing | React Router 7 |
| Backend | Node 20, Express 5, SQLite (`sqlite` / `sqlite3`), JWT, bcryptjs |
| Tooling | ESLint 9 (flat config), npm |

---

## Repository layout

```
portfolio-2026/
├── src/
│   ├── components/     # Page sections + AdminDashboard
│   ├── config/         # API base URL (Vite env aware)
│   ├── lib/            # e.g. resolveMediaUrl for CMS-style paths
│   ├── App.jsx
│   └── main.jsx
├── public/             # Static assets copied to dist root (e.g. /assets/*, _redirects)
├── backend/            # Express API + SQLite DB file
├── .github/workflows/  # CI workflow
├── vercel.json         # SPA rewrite for Vercel
└── package.json
```

---

## Prerequisites

- **Node.js 20+** (matches `backend/package.json` engines)
- npm (or compatible client)

---

## Environment variables (frontend)

Copy `.env.example` to `.env` or `.env.local` and adjust if your API or asset host differs.

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Full JSON API base, including `/api` (e.g. `https://your-api.onrender.com/api`) |
| `VITE_API_ORIGIN` | API origin without `/api` (used with `API_ORIGIN` in code) |
| `VITE_ASSET_ORIGIN` | Force media host for root-relative `/assets/...` paths when files are **not** on the same origin as the SPA |

If unset, the app defaults to the bundled Render URL in `src/config/api.js` (update that constant for your own deployment).

---

## Local development

### Frontend

```bash
npm install
npm run dev
```

Opens the Vite dev server (default port `5173`). API calls use `VITE_*` values or the default API URL.

### Backend (optional)

From `backend/`:

```bash
cd backend
npm install
cp .env.example .env   # if you add one; set JWT_SECRET for production
npm start
```

Default port `5000` (or `PORT` from env). Serves JSON under `/api` and static uploads under `/assets` from `backend/public/assets`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the frontend |

---

## Deployment

### Static frontend (Vercel / Netlify / similar)

1. Build command: `npm run build`
2. Output directory: `dist`
3. **SPA routing:** this repo includes `vercel.json` rewrites and `public/_redirects` (Netlify) so client routes like `/admin` resolve to `index.html`.

### Media files

Place project/testimonial assets under **`public/assets/`** so URLs like `/assets/your-file.png` work on the same origin as the deployed site. Alternatively set `VITE_ASSET_ORIGIN` to a server that hosts those files.

### Backend

Deploy the `backend/` folder to your host (e.g. Render, Railway). Set **`JWT_SECRET`** to a strong value in production. Persist or back up `portfolio.db` if you rely on SQLite on disk.

---

## API overview (backend)

High-level routes (all under `/api` unless you mount differently):

- `GET/POST` projects, testimonials (admin for mutations)
- `POST /contact` — contact form
- `GET/PUT` resume URL setting
- `POST /login`, `GET /verify` — admin auth

See `backend/server.js` for the full list.

---

## Admin

- Route: **`/admin`** (after build + SPA hosting rules)
- Default seeded credentials exist only in local DB setup (change password in production).

---

## Author

**Serge Ishimwe** — full-stack developer, aspiring AI engineer.

---

## Suggested GitHub repository settings

Paste into the repository **About** description (short):

> Personal portfolio — React, Vite, GSAP, Lenis, Express/SQLite API. Smooth scroll, scroll-driven UI, admin dashboard.

**Topics / tags** you can add on GitHub:

`react` `vite` `portfolio` `gsap` `lenis` `smooth-scroll` `express` `sqlite` `javascript` `frontend`

---

## License

This project is **private** / personal unless you choose to add an explicit license file.
