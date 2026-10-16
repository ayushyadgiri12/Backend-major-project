# TuneStream Backend

Music streaming REST API built with **Node.js, Express, MongoDB (Mongoose), Firebase Storage/Auth and Socket.io**.

## Features
- JWT authentication (+ optional Firebase Auth token exchange), roles: `listener` / `artist`
- Artists upload audio (Firebase Storage, or local `./uploads` fallback), listeners stream it
- Playlists (public/private) with add/remove tracks
- Artist dashboard (total plays, top tracks, plays by genre)
- Search by genre / title / album
- Socket.io: live playlist updates and "now playing" events
- Optional: recommendations API, offline mock API
- Swagger docs at `/api-docs`

## Setup
```bash
npm install
cp .env.example .env        # then edit values
npm run dev                 # or: npm start
```
Requires a running MongoDB (local or Atlas). Open http://localhost:5000/api-docs.

### Firebase (optional)
1. Firebase Console -> Project settings -> Service accounts -> *Generate new private key*, save as `serviceAccountKey.json` in the project root.
2. Enable **Storage**, copy the bucket name into `FIREBASE_STORAGE_BUCKET`.
3. Without these, audio is saved locally in `uploads/`.

## Endpoints
| Area | Endpoint |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/firebase`, `GET /api/auth/me` |
| Tracks | `GET /api/tracks`, `GET /api/tracks/:id`, `POST /api/tracks` (artist, multipart `audio`), `PUT /api/tracks/:id`, `DELETE /api/tracks/:id`, `GET /api/tracks/:id/stream` |
| Search | `GET /api/tracks/search?q=rock` |
| Playlists | `POST/GET /api/playlists`, `GET/PUT/DELETE /api/playlists/:id` |
| Playlist tracks | `POST /api/playlists/:id/tracks` `{trackId}`, `DELETE /api/playlists/:id/tracks/:trackId` |
| Artists | `GET /api/artists`, `GET /api/artists/:id`, `GET /api/artists/me/dashboard` |
| Extras | `GET /api/recommendations`, `GET /api/offline/tracks` |

All routes except register/login/firebase/offline need `Authorization: Bearer <token>`.

## Example flow
1. Register an artist, login, copy the token.
2. `POST /api/tracks` (form-data: `audio`, `title`, `genre`).
3. Register a listener -> `GET /api/tracks/search?q=rock`
4. `POST /api/playlists` -> `POST /api/playlists/:id/tracks`
5. `GET /api/tracks/:id/stream` to play.

## Socket.io
```js
const socket = io('http://localhost:5000', { auth: { token: '<JWT>' } });
socket.emit('playlist:join', playlistId);
socket.on('playlist:track-added', console.log);
socket.emit('now-playing', { trackId });
```

## Project structure
```
server.js          entry (HTTP + Socket.io)
src/app.js         Express app
src/config         db, firebase
src/models         User, Track, Playlist
src/controllers    business logic
src/routes         modular routes
src/middleware     auth, upload, validation, errors
src/services       storage (Firebase/local)
src/sockets        Socket.io handlers
src/docs           Swagger spec
```

## Deployment (Render)
Build: `npm install` | Start: `npm start` | set env vars from `.env.example` (use MongoDB Atlas for `MONGO_URI`).
Note: Render's disk is ephemeral, so use Firebase Storage in production.
