# Deployment Guide — Single Service on Render

**Everything (frontend + API) runs from one Render URL. No CORS. No cross-platform config.**

---

## Prerequisites (all free)

| Service | URL | Purpose |
|---|---|---|
| GitHub | github.com | Source repo |
| Render | render.com | Hosts everything |
| MongoDB Atlas | cloud.mongodb.com | Database (already working) |
| Cloudinary | cloudinary.com | Persistent admin image uploads |

---

## Step 1 — Get Cloudinary credentials (5 min)

1. Go to [cloudinary.com](https://cloudinary.com) → sign up free
2. On your dashboard copy: **Cloud Name**, **API Key**, **API Secret**

---

## Step 2 — Allow all IPs in MongoDB Atlas

Render's free tier uses dynamic IPs, so Atlas must allow any connection:

1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Go to **Network Access** → **Add IP Address**
3. Click **Allow Access from Anywhere** → Confirm → `0.0.0.0/0`

---

## Step 3 — Deploy to Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub account and select the `portfolio-2026` repo
3. Use these exact settings:

   | Field | Value |
   |---|---|
   | Name | `portfolio` (or anything) |
   | Root Directory | *(leave blank — use repo root)* |
   | Runtime | Node |
   | Build Command | `npm install && npm run build && cp -r dist backend/dist` |
   | Start Command | `node backend/server.js` |
   | Instance Type | **Free** |

4. Under **Environment Variables** add all of these:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | `mongodb://sergeishimwe_db_user:70oKJkSITEP449xh@ac-yj0cvoy-...` *(your full Atlas URI)* |
   | `JWT_SECRET` | `b6c252c58755343da8eac2699136ca50131f464143738a2807b06b394e7d4e4f04ac70bb2ba1b82b9accc6f76428b85d` |
   | `CLOUDINARY_CLOUD_NAME` | *(from Step 1)* |
   | `CLOUDINARY_API_KEY` | *(from Step 1)* |
   | `CLOUDINARY_API_SECRET` | *(from Step 1)* |
   | `NODE_VERSION` | `20.18.0` |

5. Click **Create Web Service**
6. Wait ~3 minutes for build + deploy
7. Your URL will be: `https://portfolio-xxxx.onrender.com` ← share this link

---

## Step 4 — Verify

Open `https://portfolio-xxxx.onrender.com` and check:

- [ ] Homepage loads correctly
- [ ] Projects and testimonials show up
- [ ] Contact form submits
- [ ] `/admin` → log in with `admin` / `admin123`
- [ ] Admin: add a project → appears on homepage
- [ ] Admin: upload a photo → stays after page refresh (Cloudinary)
- [ ] Admin: delete a project → disappears from homepage
- [ ] Admin → Settings → **change the default password** immediately

---

## Notes

### Cold starts
Render free spins down after 15 min of inactivity. First visit after that takes ~20–30 sec. 
Fix: add a free uptime monitor at [uptimerobot.com](https://uptimerobot.com) to ping `https://portfolio-xxxx.onrender.com/api/health` every 14 minutes.

### Image uploads
With Cloudinary set up, admin-uploaded images go to Cloudinary CDN and never disappear on redeploy. Without Cloudinary, uploads are lost on each redeploy (but the bundled `/assets/` images are always there).

### Redeployment
Every time you push to `main` on GitHub, Render automatically rebuilds and redeploys.
