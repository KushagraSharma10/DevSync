# Deploy DevSync (Vercel client + Render server)

Free-tier MVP hosting. Order matters: **server first**, then client, then fix CORS.

**Deploy branch (for now):** `dev` on both Render and Vercel. Switch to `main` later if you want a separate release branch.

## What you need

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) M0 cluster (you likely already have this)
- [Render](https://render.com) account (API + Socket.IO)
- [Vercel](https://vercel.com) account (frontend)
- Repo on GitHub: `KushagraSharma10/DevSync` (latest `dev`)

## 1. MongoDB Atlas

1. Database → Connect → Drivers → copy the SRV URI.
2. Use database name `devsync` in the path, e.g.  
   `mongodb+srv://USER:PASS@CLUSTER.mongodb.net/devsync?retryWrites=true&w=majority`
3. Network Access → allow `0.0.0.0/0` (Render has dynamic IPs on free tier).

## 2. Render — backend

1. **New → Web Service** → connect the GitHub repo `KushagraSharma10/DevSync`.
2. Settings:
   - **Branch:** `dev`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance:** Free
3. **Environment** (Environment tab):

| Key | Value |
|-----|--------|
| `MONGO_URI` | Atlas URI from step 1 |
| `JWT_SECRET` | Long random string (not in git) |
| `CLIENT_URL` | Temporary: `http://localhost:5173` — **update after Vercel** |
| `PORT` | Leave unset (Render injects `PORT`) |

4. Deploy. Open the service URL, e.g. `https://devsync-xxxx.onrender.com`.
5. Check: `GET https://YOUR-RENDER-URL/health` → `{"status":"ok"}`.

**Note:** Free Render sleeps after idle; first request / socket connect can take ~30–60s.

## 3. Vercel — frontend

1. **Add New Project** → import the same GitHub repo.
2. Settings:
   - **Production Branch:** `dev` (Project → Settings → Git, if asked)
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
3. **Environment Variables** (Production):

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-RENDER-URL` (no trailing slash) |
| `VITE_SOCKET_URL` | Same as `VITE_API_URL` |

4. Deploy. You get something like `https://devsync-xxxx.vercel.app`.

## 4. Wire CORS (required)

1. Render → Environment → set  
   `CLIENT_URL` = `https://YOUR-VERCEL-URL` (no trailing slash).
2. **Manual Deploy** / restart the Render service so CORS picks up the new origin.
3. Open the Vercel URL → register → create room → second browser join.

## 5. Smoke after deploy

- [ ] `/health` on Render is ok
- [ ] Register / login on Vercel
- [ ] Create room + join by code (2 browsers)
- [ ] Code sync + chat + presence
- [ ] Theme toggle still works

## Local vs production

| | Local | Production |
|--|--------|------------|
| Client | `npm run dev` in `client/` | Vercel |
| Server | `npm run dev` in `server/` | Render |
| Client env | `client/.env` | Vercel project env |
| Server env | `server/.env` | Render env |

Never commit real `.env` files or secrets.

## Troubleshooting

- **CORS / network errors in browser:** `CLIENT_URL` must match the Vercel origin exactly (https, no trailing slash). Redeploy Render after changing it.
- **Socket stuck on Connecting:** Render cold start — wait and refresh; confirm `VITE_SOCKET_URL` points at Render.
- **Mongo connection failed:** Atlas Network Access + URI password URL-encoded if it has special characters.
- **404 on API:** `VITE_API_URL` must be the Render root, not a path like `/api`.
