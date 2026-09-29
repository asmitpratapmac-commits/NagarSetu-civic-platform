# NagarSetu AI

**Connecting Citizens. Improving Cities.**

A full-stack civic-tech platform where citizens report civic issues (potholes, garbage,
streetlight outages, water leakage, and more), an AI service classifies and routes each
report automatically, city officers resolve them with photo evidence, and citizens confirm
the fix before a case closes.

---

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tech stack](#tech-stack)
5. [Folder structure](#folder-structure)
6. [Installation](#installation)
7. [Environment variables](#environment-variables)
8. [MongoDB setup](#mongodb-setup)
9. [Cloudinary setup](#cloudinary-setup)
10. [Running the project](#running-the-project)
11. [API overview](#api-overview)
12. [Authentication](#authentication)
13. [Role permissions](#role-permissions)
14. [AI architecture](#ai-architecture)
15. [Map configuration](#map-configuration)
16. [Deployment](#deployment)
17. [Production considerations](#production-considerations)
18. [Future improvements](#future-improvements)

---

## Overview

NagarSetu AI has three portals sharing one backend:

- **Citizen** — report issues with photos + map location, track status in real time, confirm resolutions.
- **Authority** — manage an assigned queue, update status, upload before/after evidence, resolve cases.
- **Admin** — command-center analytics, user/department management, SLA & AI configuration, audit logs.

Every complaint is automatically classified, prioritized, given an SLA deadline, and routed to
a department by a separate AI microservice — with a heuristic fallback so the app works fully
even before a real ML model is plugged in.

## Screenshots

_Add screenshots of the landing page, citizen dashboard, complaint map, and admin command center here._

## Features

- AI-assisted complaint classification, severity/priority detection, department routing, duplicate detection, and summarization
- Standalone AI image-detection tool (upload a photo, get an instant read before filing a report)
- Leaflet + OpenStreetMap + Nominatim for location picking, complaint mapping, and hotspot visualization — no Google Maps, no paid map APIs
- Real-time notifications and status updates via Socket.IO
- SLA deadlines by severity, with automatic overdue-flagging and escalation
- Mandatory before/after evidence before a complaint can be marked resolved
- Citizen-driven verification loop — confirm or reopen a "resolved" complaint
- Full audit log of sensitive admin actions (status/severity overrides, user/department management, settings changes)
- Role-based access control across three portals with protected, role-scoped routing
- Realistic seed data so every dashboard is populated on first run

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full breakdown of the system diagram, folder
structure rationale, and key data-model decisions (GeoJSON geo-queries, SLA auto-calculation,
why resolution evidence is enforced at the service layer, etc.).

In short:

```
React (Vite) SPA  <-- REST + WebSocket -->  Node/Express API  <-- REST -->  Python AI service (FastAPI)
                                                    |
                                                 MongoDB
```

The frontend never calls the AI service directly — everything is proxied through the Node
backend, keeping the AI service internal, stateless, and swappable.

## Tech stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Redux Toolkit, Axios, Framer Motion,
Lucide React, Recharts, React Hook Form + Zod, Leaflet + React-Leaflet, OpenStreetMap + Nominatim.

**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT auth, bcrypt, RBAC, Socket.IO, Multer +
Cloudinary, Helmet, CORS, rate limiting, Winston logging.

**AI service:** Python, FastAPI, Pydantic — modular heuristic inference today, designed to be
replaced with real ML models without touching the Node backend's contract.

## Folder structure

```
nagarsetu-ai/
├── ARCHITECTURE.md
├── README.md
├── backend/
│   ├── config/          # db, cloudinary, constants
│   ├── controllers/       # thin HTTP handlers
│   ├── services/           # business logic
│   ├── models/               # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── middleware/               # auth, rbac, error handling, upload, rate limiting
│   ├── validators/                  # Zod request schemas
│   ├── sockets/                       # Socket.IO setup
│   ├── utils/                           # logger, seed script, ApiError/ApiResponse
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/    # shared UI + map components
│       ├── pages/           # public/, citizen/, authority/, admin/, shared/
│       ├── layouts/           # PublicLayout, AppShell (sidebar + mobile nav)
│       ├── routes/               # ProtectedRoute, RoleRoute
│       ├── redux/                   # store + slices
│       ├── api/                       # axios instance + per-resource modules
│       ├── hooks/                       # useAuth, useSocket, useGeolocation, useDebounce
│       ├── services/                      # socket client singleton
│       └── styles/                          # Tailwind entrypoint
└── ai-service/
    ├── app/          # FastAPI app instance
    ├── models/         # Pydantic schemas
    ├── services/         # prediction logic per capability (swap-points for real ML)
    ├── routes/             # endpoint routers
    ├── utils/                # heuristic engine (mock "AI")
    └── main.py
```

## Installation

Requires Node.js ≥ 18, Python ≥ 3.10, and a MongoDB instance (local or Atlas).

```bash
# 1. Clone / unzip the project, then install each service:
cd backend && npm install
cd ../frontend && npm install
cd ../ai-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

## Environment variables

Copy each `.env.example` to `.env` and fill in real values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env
```

Key variables:

| File | Variable | Purpose |
|---|---|---|
| `backend/.env` | `MONGO_URI` | MongoDB connection string |
| `backend/.env` | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | long random strings for signing tokens |
| `backend/.env` | `CLOUDINARY_*` | media upload credentials |
| `backend/.env` | `AI_SERVICE_URL` | where the Node backend reaches the Python AI service |
| `frontend/.env` | `VITE_API_URL` / `VITE_SOCKET_URL` | where the frontend reaches the backend |
| `ai-service/.env` | `USE_REAL_MODELS` | flips on once real ML models are wired into `services/` |

## MongoDB setup

- **Local:** install MongoDB Community Edition and use `mongodb://localhost:27017/nagarsetu-ai`.
- **Atlas:** create a free cluster, add your IP to the access list, and use the provided
  connection string as `MONGO_URI`. The `Complaint` model requires a `2dsphere` index on
  `location`, which Mongoose creates automatically in development (`autoIndex: true`).

## Cloudinary setup

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy your **Cloud name**, **API key**, and **API secret** from the dashboard into `backend/.env`.
3. Uploads (complaint photos/videos, resolution evidence) are automatically routed through
   `multer-storage-cloudinary` — no further setup needed.

## Running the project

Run all three services in separate terminals:

```bash
# Terminal 1 — AI service
cd ai-service && source venv/bin/activate && python main.py
# → http://localhost:8000

# Terminal 2 — Backend
cd backend && npm run seed   # first time only — populates realistic demo data
cd backend && npm run dev
# → http://localhost:5000

# Terminal 3 — Frontend
cd frontend && npm run dev
# → http://localhost:5173
```

**Demo logins** (created by `npm run seed`), all with password `Password@123`:

| Role | Email |
|---|---|
| Admin | `admin@nagarsetu.ai` |
| Authority (5 officers, one per department) | `officer.roads@nagarsetu.ai`, `officer.sanitation@nagarsetu.ai`, `officer.electrical@nagarsetu.ai`, `officer.water@nagarsetu.ai`, `officer.traffic@nagarsetu.ai` |
| Citizen (12 accounts) | `citizen1@example.com` … `citizen12@example.com` |

## API overview

All routes are prefixed `/api`. Full list in `backend/routes/`; highlights:

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Citizen self-registration |
| POST | `/auth/login` | Login, returns access + refresh tokens |
| POST | `/complaints` | Create a complaint (citizen, multipart with media) — triggers AI analysis |
| GET | `/complaints/nearby` | Geo-query public complaints near a point |
| GET | `/complaints/hotspots` | Aggregated hotspot data for the map layer |
| POST | `/complaints/:id/assign` | Admin assigns/reassigns an officer |
| PATCH | `/complaints/:id/status` | Officer/admin transitions status (validated state machine) |
| POST | `/complaints/:id/resolution-evidence` | Upload before/after evidence (required before resolving) |
| POST | `/complaints/:id/resolve` | Mark resolved — rejected if no evidence uploaded |
| POST | `/complaints/:id/verify` | Citizen confirms or reopens a resolution |
| GET | `/analytics/admin/summary` | Command-center headline numbers |
| POST | `/ai/detect-image` | Standalone AI image-detection tool |

The AI service itself exposes: `POST /predict-complaint`, `POST /detect-image`,
`POST /detect-duplicate`, `POST /summarize`, `GET /health`.

## Authentication

JWT access tokens (short-lived, 15 min default) + refresh tokens (7 days default), stored in
`localStorage` on the frontend. Axios interceptors automatically retry a request with a
refreshed token on a 401, and force a re-login if the refresh token itself is invalid/expired.
Socket.IO connections are authenticated with the same access token via the handshake.

## Role permissions

| Capability | Citizen | Authority | Admin |
|---|:---:|:---:|:---:|
| Create complaints | ✅ | ❌ | ❌ |
| View own complaints | ✅ | — | — |
| View assigned complaints | — | ✅ | — |
| View all complaints | ❌ | ❌ | ✅ |
| Assign/reassign complaints | ❌ | ❌ | ✅ |
| Update complaint status | ❌ | ✅ (own) | ✅ (any, incl. override) |
| Upload resolution evidence & resolve | ❌ | ✅ (own) | ❌ |
| Confirm/reopen resolution | ✅ (own) | ❌ | ❌ |
| Manage departments/users/settings | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |

## AI architecture

The AI service is intentionally **stateless and modular** — see `ai-service/utils/heuristics.py`
for the current keyword/similarity-based mock inference, and `ai-service/services/*.py` for the
thin service layer that wraps it. To plug in a real model:

1. Keep the same Pydantic request/response shapes in `ai-service/models/schemas.py`.
2. Replace the body of the relevant function in `services/` (e.g. `complaint_predictor.predict()`)
   with your model's inference call.
3. Nothing in the Node backend, routes, or frontend needs to change.

The Node backend's `aiService.js` also has a safe fallback: if the AI service is ever
unreachable, complaint submission still succeeds with a "Medium/manual review" default rather
than failing.

## Map configuration

Only OpenStreetMap tiles, Leaflet, and the free Nominatim geocoding API are used — no Google
Maps, no paid map API keys required. Every complaint marker uses the complaint's MongoDB `_id`
as its React key and popup link target. Marker colors are severity-based and drawn from the
app's own palette (no default Leaflet blue pins).

## Deployment

- **Frontend:** build with `npm run build` in `frontend/`, deploy the `dist/` folder to any
  static host (Vercel, Netlify, S3+CloudFront). Set `VITE_API_URL`/`VITE_SOCKET_URL` to your
  deployed backend's URL at build time.
- **Backend:** deploy as a standard Node process (Render, Railway, EC2, etc.) with all
  `backend/.env` variables set. Ensure the AI service URL is reachable from wherever the
  backend runs (internal network / private URL recommended).
- **AI service:** deploy as its own small Python service (Render, Cloud Run, etc.) — it has no
  database dependency, so it scales independently and can be redeployed without touching the
  main app.
- **MongoDB:** use MongoDB Atlas in production for managed backups and scaling.

## Production considerations

- Rotate `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` to long, random values — never reuse the
  example placeholders.
- Put the AI service behind an internal network or auth header in production; it currently
  trusts any caller since it's only meant to be reached by the Node backend.
- Turn off `autoIndex` in Mongoose for production (already conditional on `NODE_ENV`) and build
  indexes explicitly during deploys instead.
- Add a process manager (PM2) or container orchestration for the Node backend and AI service.
- Consider a CDN in front of Cloudinary-served media for high-traffic deployments.

## Future improvements

- Replace the heuristic AI engine with a fine-tuned text classifier and a real vision model for
  image detection.
- Push notifications (web push / FCM) in addition to in-app Socket.IO notifications.
- Multi-language support for complaint submission and the public-facing site.
- A public read-only API for open civic data (complaint counts, resolution rates by ward).
- Automated department performance recalculation on a schedule (currently on-demand via the
  admin panel).
