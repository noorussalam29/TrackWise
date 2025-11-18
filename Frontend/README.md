Frontend for TrackWise

Setup:
- Copy `.env.example` from repo root (or set `VITE_API_URL`) if needed.
- Run `npm install` inside `frontend`.
- Run `npm run dev` to start Vite on port 5173.

Notes:
- Axios instance `src/services/api.js` has interceptors for refresh tokens.
- Pages and components are skeletons — expand UI and add styling.
