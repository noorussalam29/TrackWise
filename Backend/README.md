Backend for TrackWise

Setup:
- Copy `.env.example` to `.env` and fill values.
- Run `npm install` inside `backend`.
- Run `npm run dev` to start with `nodemon` (requires `MONGO_URI`).
- Run `node src/seed.js` to create an initial admin user.

API:
- Health: GET /api/health
- Auth: /api/auth/*
- Attendance: /api/attendance/*

Notes:
- This is an MVP scaffold. Implement business logic in controllers and add validation as needed.
