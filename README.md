# DevSync

Realtime collaborative coding rooms — live editor sync, presence, and chat in one place.

Pair with a teammate, join with a room code, and code together without juggling pastebins and screen shares.

## Features
- Email/password authentication (JWT)
- Create / join rooms with a short invite code
- Live collaborative code editor (Monaco + Socket.IO)
- Online presence (who is in the room)
- Room chat
- Dark and light theme
- Single shared editor buffer (multi-file tabs later)

## Tech stack
| Layer | Stack |
|-------|--------|
| Frontend | React (Vite), TypeScript, Tailwind CSS, Zustand, Monaco |
| Backend | Node.js, Express, JavaScript, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Hosting | Vercel (client) + Render (server) — see [DEPLOY.md](./DEPLOY.md) |

## Project structure
```text
devsync/
├── client/          # Vite React app
├── server/          # Express + Socket.IO API
├── DEPLOY.md        # Production deploy steps
└── README.md
```

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB Atlas (or local Mongo) for the server

### Server
```bash
cd DevSync/server
cp .env.example .env
# fill MONGO_URI, JWT_SECRET, CLIENT_URL
npm install
npm run dev
```

### Client
```bash
cd DevSync/client
cp .env.example .env
npm install
npm run dev
```

Example `client/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Example `server/.env` — see `server/.env.example`.

Open the client URL from the terminal (usually `http://localhost:5173`).

## How it works (short)
1. Sign up / sign in
2. Create a room or join with a code
3. Editor, presence, and chat stay in sync over Socket.IO

**Sync model:** last-write-wins document sync for small rooms (about 2–4 people). Not full CRDT/OT yet.

## Deploy
Production steps (Atlas + Render + Vercel): **[DEPLOY.md](./DEPLOY.md)**.

## Build phases
- [x] Phase 0 — Client setup
- [x] Phase 1 — Auth
- [x] Phase 2 — Rooms REST + dashboard
- [x] Phase 3 — Realtime editor + presence
- [x] Phase 4 — Chat + polish
- [ ] Phase 5 — Deploy (follow DEPLOY.md)

## Roadmap
- [ ] Multi-file tabs
- [ ] Stronger collaborative editing (CRDT/OT)
- [ ] Video (optional)
- [ ] Task board (optional)

## Author
**Kushagra Sharma** — [KushagraSharma10](https://github.com/KushagraSharma10)

## License
MIT
