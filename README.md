# Lost & Found Full Stack Web App

Existing HTML/CSS/JS pages are preserved at the project root. A production-oriented MongoDB/Express backend lives in `backend/`, and the root frontend server proxies the existing `backend-php/*.php` form/API URLs to that backend so old page links and form actions keep working.

## Requirements

- Node.js 20+
- MongoDB running locally, or a MongoDB Atlas connection string

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

If you see `ECONNREFUSED 127.0.0.1:27017`, MongoDB is not running. Fix it with one of these options:

```bash
# Option A: Docker, from the project root
docker compose up -d mongo
cd backend
npm run dev
```

```text
Option B: Install MongoDB Community Server, start the MongoDB service,
then run: cd backend && npm run dev
```

```text
Option C: Use MongoDB Atlas, then put your connection string in backend/.env:
MONGO_URI=mongodb+srv://...
```

Default backend URL:

```text
http://localhost:5000
```

Demo accounts are seeded automatically when the users collection is empty:

```text
rahim@example.com / password
admin@lostfound.local / password
```

## Frontend Setup

In another terminal:

```bash
npm install
npm start
```

Open:

```text
http://localhost:8000/Landing%20Page.html
```

If port `8000` is busy:

```bash
$env:PORT=8001; npm start
```

## Configuration

Root `.env`:

```text
PORT=8000
BACKEND_URL=http://localhost:5000
```

Backend `.env`:

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lost_found_app
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:8000
```

## Implemented Systems

- JWT authentication with HttpOnly cookie support
- Register, login, logout, current user, forgot/reset password API
- Profile update, avatar upload, settings, password change
- Lost/found post CRUD, image upload, search, category/status filters
- Favorites/bookmarks
- Claims with owner/admin notification
- Conversations and persisted messages
- Socket.IO notifications, conversation rooms, typing events
- User notifications and read state
- Reports and user feedback
- Admin stats, users, posts, reports, claims, moderation actions
- MongoDB schemas and indexes for users, posts, conversations, messages, claims, notifications, favorites, reports, admin logs, and categories
- Security middleware: Helmet, CORS, rate limiting, Mongo sanitization, validation, bcrypt hashing

## Important Paths

- Frontend pages: root `*.html`, `*.css`, `*.js`
- Shared frontend helpers: `js/lf-core.js`, `js/lf-ui.js`
- Frontend/proxy server: `dev-server.js`
- Backend app: `backend/src/server.js`
- Backend models: `backend/src/models/index.js`
- Backend uploads: `backend/uploads`

## Notes

The older PHP and SQLite compatibility files remain in the repository so existing paths are not broken. When the Mongo backend is running, `dev-server.js` proxies `/backend-php/*`, `/api/*`, `/uploads/*`, and `/socket.io/*` to `BACKEND_URL`.
