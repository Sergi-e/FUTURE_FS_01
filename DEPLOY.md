# Deployment Guide — Vercel (Frontend + API)

The entire project runs as a single Vercel deployment. No separate backend service needed.

---

## Prerequisites

| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com) | Hosts frontend + serverless API |
| [MongoDB Atlas](https://cloud.mongodb.com) | Database (free M0 tier) |
| [Cloudinary](https://cloudinary.com) | Persistent image storage for admin uploads |

---

## Step 1 — MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with **read/write** access
3. Under **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
4. Under **Connect** → **Connect your application** → copy the `mongodb+srv://` connection string

---

## Step 2 — Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. From your dashboard copy: **Cloud Name**, **API Key**, **API Secret**

---

## Step 3 — Deploy to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Framework preset: **Vite**
4. Leave build settings as default (Vercel auto-detects from `vercel.json`)
5. Under **Environment Variables** add:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0` |
   | `JWT_SECRET` | A long random string (e.g. generate with `openssl rand -hex 32`) |
   | `CLOUDINARY_CLOUD_NAME` | From Step 2 |
   | `CLOUDINARY_API_KEY` | From Step 2 |
   | `CLOUDINARY_API_SECRET` | From Step 2 |

6. Click **Deploy**

---

## Step 4 — Verify

Open `https://your-project.vercel.app` and confirm:

- [ ] Homepage loads correctly
- [ ] Projects and testimonials appear
- [ ] Contact form submits
- [ ] `/admin` → log in with `admin` / `admin123`
- [ ] Admin: add a project with image upload
- [ ] Admin: delete a project
- [ ] Admin → Settings → **change the default password immediately**

---

## Notes

### Cold starts
The first API request after a period of inactivity takes 5–15 seconds while the serverless function connects to MongoDB. Subsequent requests are fast.

### Redeployment
Every push to `main` on GitHub triggers an automatic Vercel redeploy.

### Custom domain
In Vercel → Project → Settings → Domains → add your domain or a `*.vercel.app` alias.
