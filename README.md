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
| Backend (later) | Node.js, Express, TypeScript, Socket.IO |
| Database (later) | MongoDB (Mongoose) |
| Auth (later) | JWT + bcrypt |

## Project structure
```text
devsync/
└── client/          # Vite React app (current focus)
```

## Getting started

### Prerequisites
- Node.js 18+

### Client
```bash
git clone https://github.com/KushagraSharma10/DevSync.git
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

Open the client URL from the terminal (usually `http://localhost:5173`).

Server will be added in a later phase.

## How it works (short)
1. Sign up / sign in
2. Create a room or join with a code
3. Editor, presence, and chat stay in sync over Socket.IO

**Sync model:** last-write-wins document sync for small rooms (about 2–4 people). Not full CRDT/OT yet.

## Build phases
- [x] Phase 0 — Client setup
- [ ] Phase 1 — Auth
- [ ] Phase 2 — Rooms REST + dashboard
- [ ] Phase 3 — Realtime editor + presence
- [ ] Phase 4 — Chat + polish
- [ ] Phase 5 — Deploy docs (when requested)

## Roadmap
- [ ] Multi-file tabs
- [ ] Stronger collaborative editing (CRDT/OT)
- [ ] Video (optional)
- [ ] Task board (optional)

## Author
**Kushagra Sharma** — [KushagraSharma10](https://github.com/KushagraSharma10)

## License
MIT
