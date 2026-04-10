# Serge Ishimwe — Portfolio

A full-stack personal portfolio designed to present my work, skills, and story in one smooth, scroll-driven experience. It combines a React (Vite) frontend with GSAP and Lenis for motion, plus a small **Express + SQLite** API so projects, testimonials, the contact form, resume link, and an **admin dashboard** stay easy to update and deploy.

**Stack at a glance:** React 19 · Vite · GSAP / ScrollTrigger · Lenis · React Router · Express · SQLite · JWT.

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

**Production:** set `VITE_API_BASE_URL` and `VITE_API_ORIGIN` on your static host (e.g. Netlify). If unset, production builds use relative `/api` (usually wrong for this split setup). Local dev defaults to `http://localhost:5000` when `import.meta.env.DEV` is true.

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

### Full stack (recommended): Netlify (frontend) + Render (API)

**1. Backend on Render**

1. New **Web Service** → connect this repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npm rebuild sqlite3 --build-from-source` (same as `npm run render-build`).
4. **Start Command:** `npm start`
5. **Environment:** set **`JWT_SECRET`** to a long random string (required for admin login).
6. After deploy, copy the service URL (e.g. `https://your-api.onrender.com`). Open `https://your-api.onrender.com/api/health` — you should see `{"ok":true}`. If you get `x-render-routing: no-server` or plain “Not Found”, the URL is wrong or the service failed to start (check Render logs).
7. **SQLite persistence:** Render’s filesystem is ephemeral unless you add a **persistent disk**. Mount it (e.g. to `/data`) and set **`PORTFOLIO_DB_PATH=/data/portfolio.db`** on the service. Without a disk, the DB resets when the instance restarts or redeploys.

**2. Frontend on Netlify**

1. New site from Git → same repo, **base directory empty** (repo root).
2. **Build command:** `npm run build`
3. **Publish directory:** `dist`
4. **Environment variables** (Site settings → Environment variables), then trigger a new deploy (clear cache if you change them):

   | Name | Example value |
   |------|----------------|
   | `VITE_API_ORIGIN` | `https://your-api.onrender.com` (no trailing slash) |
   | `VITE_API_BASE_URL` | `https://your-api.onrender.com/api` |

5. `netlify.toml` already SPA-rewrites `/*` → `/index.html` so `/admin` works.

**3. Media (projects / testimonials)**

- Easiest: keep files in **`public/assets/`** in this repo so Netlify serves them at `https://your-site.netlify.app/assets/...`. The app resolves `/assets/...` to the **same origin** as the site by default.
- If media is only on the API, set **`VITE_ASSET_ORIGIN`** to your Render URL so `resolveMediaUrl` points `/assets/...` at the backend.

**4. CORS**

The API uses open `cors()` so the Netlify origin can call Render without extra config.

---

### Static frontend only (Vercel / Netlify / similar)

1. Build command: `npm run build`
2. Output directory: `dist`
3. **SPA routing:** `vercel.json` and `public/_redirects` / `netlify.toml` send client routes like `/admin` to `index.html`.

### Backend elsewhere

Deploy the `backend/` folder (Railway, Fly.io, VPS, etc.). Set **`JWT_SECRET`**. Use **`PORTFOLIO_DB_PATH`** when the SQLite file should live on a mounted volume.

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

## GitHub profile & repo About

The line under your repo name on your profile comes from the repo **About** description on GitHub (not from this README).

### If the description will not save

- Use **plain typing** or paste from the **ASCII lines below** (avoid curly quotes or long em dashes copied from the web).
- Stay under **350 characters** (GitHub’s limit).
- Click **Save changes** at the bottom of the About panel (closing the panel without saving discards edits).
- Add **Topics** one at a time: type a word, press **Enter**, then save. Do not paste the whole topic list as one blob into the description box.
- Try another browser or a private window if the button does nothing (extensions sometimes block GitHub).
- Try **Settings** (not only the About gear): open `https://github.com/Sergi-e/FUTURE_FS_01/settings` → **General** → find the **Description** field under the repository name, save with **Save** at the bottom of that page.

### Set the description via API (when the website still fails)

Use **Node** (same as this project) so auth matches what GitHub expects:

1. Create a **Personal Access Token** (never commit it):
   - **Classic (simplest):** [New classic token](https://github.com/settings/tokens/new) → enable **`repo`** → generate → copy `ghp_...`.
   - **Fine-grained:** [New fine-grained token](https://github.com/settings/personal-access-tokens/new) → repository **FUTURE_FS_01** only → **Administration**: **Read and write**.

2. From the project root in a terminal:

```bash
# Windows CMD
set GITHUB_TOKEN=ghp_your_token_here
npm run repo:description

# PowerShell
$env:GITHUB_TOKEN = "ghp_your_token_here"
npm run repo:description
```

Custom one-liner:

```bash
npm run repo:description -- "Personal portfolio - React, Vite, Express, SQLite."
```

The script tries **Bearer** and **`token`** auth (classic PATs often need the second). If it still fails, the printed **JSON error message** is the real reason (wrong scopes, SSO not authorized, typo in token, etc.).

**PowerShell-only** (alternative): `.\scripts\set-github-repo-description.ps1`

Revoke the token after use if you want it gone.

### Copy-paste descriptions (plain ASCII)

**Recommended (one line):**

```text
Full-stack portfolio: React, Vite, GSAP, Lenis, Express, SQLite API, projects, testimonials, contact, admin dashboard.
```

**Shorter:**

```text
Personal portfolio - React, Vite, GSAP, Lenis, Express, SQLite, admin tools.
```

**Topics to add separately** (each as its own topic chip): `react` `vite` `portfolio` `gsap` `lenis` `express` `sqlite` `javascript` `fullstack`

---

## License

This project is **private** / personal unless you choose to add an explicit license file.
