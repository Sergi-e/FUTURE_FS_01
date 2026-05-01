# Deployment Guide

**Stack:** Render (Express API) + Vercel (React frontend) + MongoDB Atlas + Cloudinary

---

## Prerequisites — accounts you need (all free)

| Service | URL | Purpose |
|---|---|---|
| GitHub | github.com | Source repo (already done) |
| Render | render.com | Hosts the Express backend API |
| Vercel | vercel.com | Hosts the React frontend |
| MongoDB Atlas | cloud.mongodb.com | Database (already working) |
| Cloudinary | cloudinary.com | Persistent admin image uploads |

---

## Step 1 — Get your Cloudinary credentials

1. Go to [cloudinary.com](https://cloudinary.com) → sign up free
2. On the dashboard you'll see **Cloud Name**, **API Key**, **API Secret**
3. Save these three values — you'll need them in Step 2

---

## Step 2 — Deploy the backend to Render

1. Go to [render.com](https://render.com) → sign in with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repo (`portfolio-2026`)
4. Use these settings:
   - **Name:** `portfolio-api` (or anything you like)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Under **Environment Variables**, add these (click "Add Environment Variable" for each):

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | `mongodb://sergeishimwe_db_user:70oKJkSITEP449xh@ac-yj0cvoy-shard-00-00.krsolnl.mongodb.net:27017,...` *(your full Atlas URI)* |
   | `JWT_SECRET` | `b6c252c58755343da8eac2699136ca50131f464143738a2807b06b394e7d4e4f04ac70bb2ba1b82b9accc6f76428b85d` |
   | `CLOUDINARY_CLOUD_NAME` | *(from Step 1)* |
   | `CLOUDINARY_API_KEY` | *(from Step 1)* |
   | `CLOUDINARY_API_SECRET` | *(from Step 1)* |
   | `NODE_VERSION` | `20.18.0` |

6. Click **Create Web Service** → wait for it to deploy (2–3 min)
7. Copy your Render URL — it will look like: `https://portfolio-api-xxxx.onrender.com`
8. Test it: open `https://portfolio-api-xxxx.onrender.com/api/health` in the browser → you should see `{"ok":true,...}`

---

## Step 3 — Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. Click **Add New → Project**
3. Import your `portfolio-2026` repo
4. Vercel auto-detects Vite — confirm these settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `.` *(leave as root)*
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://portfolio-api-xxxx.onrender.com/api` *(your Render URL + /api)* |

6. Click **Deploy** → wait 1–2 min
7. Your live URL will be: `https://portfolio-2026-xxxx.vercel.app`

---

## Step 4 — Tell Render about your Vercel URL (optional but recommended)

This allows the backend CORS to explicitly whitelist your exact Vercel domain.

1. Go to Render → your service → **Environment**
2. Add one more variable:

   | Key | Value |
   |---|---|
   | `FRONTEND_URL` | `https://portfolio-2026-xxxx.vercel.app` *(your Vercel URL)* |

3. Render will auto-redeploy in ~1 min

---

## Step 5 — Verify everything works

Open your Vercel URL and check:

- [ ] Homepage loads and animations work
- [ ] Projects section shows your projects with images
- [ ] Testimonials section shows testimonials with photos
- [ ] Contact form submits successfully
- [ ] Go to `/admin` → log in with `admin` / `admin123`
- [ ] Admin: add a project → confirm it appears on the homepage
- [ ] Admin: add a testimonial with an uploaded photo → confirm photo persists (Cloudinary)
- [ ] Admin: delete a project → confirm it disappears
- [ ] Admin: change password → log in with new password

---

## Important notes

### Cold starts on Render free tier
Render's free tier **spins down** the backend after 15 minutes of no traffic. The first visitor after inactivity will wait ~20–30 seconds for the first API call. This is normal for free hosting. Subsequent requests are instant.

To avoid this: Render has a "$7/month" paid plan that stays always-on. Or you can use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping `/api/health` every 14 minutes.

### Admin password
Change the default password (`admin123`) immediately after deployment via the Admin → Settings → Change Password panel.

### Image uploads
Because you have Cloudinary configured, any image you upload via the admin dashboard will be stored on Cloudinary and will persist forever across Render redeploys. Images are served from Cloudinary's CDN.

### MongoDB Atlas IP allowlist
Make sure MongoDB Atlas allows connections from Render. In Atlas:
- Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
- This is required because Render free tier uses dynamic IPs
