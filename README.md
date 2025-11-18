# TrackWise

Employee Attendance, Time Tracking, Task Management & Admin Panel

This repository contains a scaffold for a full-stack application (React + Vite + Tailwind frontend, Node + Express + MongoDB backend).

Quickstart (local)

1. Backend
	- cd `backend`
	- copy `.env.example` to `.env` and fill `MONGO_URI` and secrets
	- `npm install`
	- `npm run dev` (starts on port 4000 by default)
	- (optional) `node src/seed.js` to create `admin@trackwise.local` with password `Password123!`

2. Frontend
	- cd `frontend`
	- `npm install`
	- `npm run dev` (Vite default port 5173)

API
- Health: `GET /api/health`
- Auth: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- Attendance: `POST /api/attendance/punch`, `GET /api/attendance/me`

Postman collection: `postman_collection.json` (set variable `baseUrl` to your backend URL)

Deployment notes
- Frontend: deploy to Vercel (build command `npm run build`, publish `dist`)
- Backend: Render / Railway (set `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `OPENAI_API_KEY`, `CLOUDINARY_URL`)
- DB: MongoDB Atlas
- Storage: Cloudinary or S3 for attachments

Notes
- This is a starter scaffold. Controllers and UI components include placeholders and should be expanded for production.
- Security: ensure strong secrets and HTTPS in production. Consider using Redis for refresh token storage and additional rate-limiting.

See `backend/README.md` and `frontend/README.md` for folder-specific notes.