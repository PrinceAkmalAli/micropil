# Micropil Website (React + Node.js)

## Run
Backend:  cd backend && cp .env.example .env && npm install && npm start       (http://localhost:5000)
Frontend: cd frontend && npm install && npm run dev                           (http://localhost:5173)

First admin = ADMIN_USER / ADMIN_PASS from backend/.env (created on first run). Change the password in .env BEFORE the first run.
Then sign in at /admin/login and create employee accounts under Team.

## Pages
/ Home, /services Procedures, /results Before & Afters, /portal Patient Portal, /contact Booking

## Admin
Overview | Appointments | Patients | Reports | Procedures | Before & Afters | Website settings | Team
- Staff: appointments, patients, payments, sessions, reports.  Admin: everything + delete, content, uploads, team.
- Upload photos (JPG/PNG/WebP up to 20 MB, stored untouched in backend/uploads) for procedures, before/after and the hero (Website settings).
- Appointments -> "Create patient ID" makes a patient (MP-0001...) with a procedure; add fee, payments, sessions on the profile.
- Every Export PDF button creates a branded PDF (logo header, table, page numbers).
- Patients open /portal, enter ID + mobile number and see procedures, payments, next session and dues.

## Production
npm run build in frontend (set VITE_API=https://your-api/api and VITE_FILES=https://your-api before building), serve dist/.
Back up backend/data.json and backend/uploads regularly. For heavy traffic move data to MongoDB/PostgreSQL.
