# Real-Time Expense Tracker & Smart Budget Planner

A production-style MERN finance platform with secure auth, JWT refresh sessions, real-time Socket.io updates, smart budget insights, analytics dashboards, PDF/Excel exports, and a polished responsive React interface.

## Stack

- React, Tailwind CSS, Framer Motion, Chart.js, Axios, React Router
- Node.js, Express, Socket.io, JWT, Nodemailer
- MongoDB, Mongoose, aggregation pipelines, indexes, pagination
- PDFKit and ExcelJS for reports

## Run Locally

```bash
npm run install:all
copy server\.env.example server\.env
npm run dev
```

Update `server/.env` with `MONGO_URI`, JWT secrets, SMTP settings, and `GOOGLE_CLIENT_ID` if you want Google login.

Client: `http://localhost:5173`  
API: `http://localhost:5000`

## Highlights

- Registration, login, refresh tokens, email verification, password reset, profile update, change password, logout
- Google ID-token login endpoint at `POST /api/auth/google`
- Add, edit, delete, search, filter, sort, and paginate transactions
- Income, expenses, custom categories, recurring metadata, budgets, savings goals
- Dashboard cards, line/bar/doughnut charts, trend summaries, category analysis
- Smart insights such as category hotspots, budget recommendations, and month-over-month changes
- Real-time expense and notification events via Socket.io
- Budget alert notifications when spending crosses configured thresholds
- PDF and Excel report downloads
- Helmet, CORS, rate limiting, sanitization, validation, logging, centralized error handling

## Verification

```bash
npm run build --prefix client
node --check server/server.js
npm audit --prefix server --audit-level=high
```
