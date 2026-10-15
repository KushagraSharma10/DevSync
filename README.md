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
| Backend | Node.js, Express, TypeScript, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
## Project structure
```text
devsync/
├── client/          # Vite React app
└── server/          # Express + Socket.IO API
```
## Getting started
### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
### 1. Clone
```bash
git clone https://github.com/KushagraSharma10/DevSync.git
cd DevSync
```
### 2. Server
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Example `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```
### 3. Client
```bash
cd ../client
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
## How it works (short)
1. Sign up / sign in
2. Create a room or join with a code
3. Editor, presence, and chat stay in sync over Socket.IO
**Sync model:** last-write-wins document sync for small rooms (about 2–4 people). Not full CRDT/OT yet.
## Roadmap
- [x] Auth, rooms, live editor, presence, chat
- [ ] Multi-file tabs
- [ ] Stronger collaborative editing (CRDT/OT)
- [ ] Video (optional)
- [ ] Task board (optional)
## Author
**Kushagra Sharma** — [KushagraSharma10](https://github.com/KushagraSharma10)
## License
MIT
