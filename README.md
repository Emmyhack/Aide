# Community Volunteer and Partner Hub

An award-winning web application that connects communities through meaningful volunteer opportunities and partnerships worldwide. Built with React, Node.js, and secured by Civic Auth for seamless, trustworthy authentication.

## Overview

The Community Volunteer and Partner Hub is a comprehensive platform designed to bridge the gap between volunteers, event organizers, and potential partners. Users can discover volunteer opportunities, register for events, and form partnerships to create positive community impact.

### Key Highlights

- **Secure Authentication**: Powered by Civic Auth for Web2-friendly login via email or social accounts
- **Comprehensive Event Management**: Full-featured event discovery, registration, and management
- **Dual Opportunity Types**: Support for both volunteer and partnership registrations
- **Responsive Design**: Beautiful, mobile-first UI built with TailwindCSS
- **Real-time Dashboard**: Personal dashboard with activity tracking and impact metrics
- **Global Reach**: Support for events worldwide with location-based filtering

## Tech Stack

### Frontend
- React 19 + Vite
- React Router
- TailwindCSS 4
- Axios

### Backend
- Node.js / Express 5
- MongoDB / Mongoose

### Deployment
- Vercel (Serverless API + Static Frontend)
- MongoDB Atlas (Production)

## Quick Start (Local)

1. Install dependencies
```bash
cd backend && npm ci
cd ../frontend && npm ci
```

2. Configure environment variables
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env
```

3. Seed (optional)
```bash
cd backend && node seedData.js
```

4. Run dev servers
```bash
# Terminal 1
cd backend && npm run dev
# Terminal 2
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Civic Auth

Set your client ID in environment variables. The app will also fallback to a provided ID for development.

- Frontend: `VITE_CIVIC_AUTH_CLIENT_ID`
- Backend: `CIVIC_AUTH_CLIENT_ID`

For this project, the provided client ID is:

```
f2fc33e0-3b6b-4ea7-bb5e-a5f60b45e808
```

## Deploying to Vercel

1. Push the repository to GitHub
2. Import the project in Vercel
3. Set these Environment Variables (Project Settings → Environment Variables):

Frontend/Global
- `VITE_API_BASE_URL` = `/api`
- `VITE_CIVIC_AUTH_CLIENT_ID` = `f2fc33e0-3b6b-4ea7-bb5e-a5f60b45e808`
- `VITE_CIVIC_AUTH_REDIRECT_URI` = `/auth/callback`

Backend/Global
- `NODE_ENV` = `production`
- `MONGODB_URI` = your MongoDB Atlas connection string
- `CIVIC_AUTH_CLIENT_ID` = `f2fc33e0-3b6b-4ea7-bb5e-a5f60b45e808`

4. Build settings (auto-detected via `vercel.json`):
- Frontend: `@vercel/static-build` building `frontend` with output `dist`
- Backend: `@vercel/node` running `backend/server.js`

5. Routing
- API: `/api/*` → `backend/server.js`
- Health: `/health` → `backend/server.js`
- Sitemap: `/sitemap.xml` → `backend/server.js`
- SPA Fallback: all others → `frontend/dist/index.html`

## Notes

- The backend lazily connects to MongoDB. If `MONGODB_URI` is not set in production, API routes that require the database will return 503. Set `MONGODB_URI` on Vercel for full functionality.
- Demo login buttons are visible only in development builds.
- TailwindCSS v4 is used via `@import 'tailwindcss';` in `src/index.css`.