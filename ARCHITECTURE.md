# NagarSetu AI — Architecture & Folder Structure

_Phase 1 of the build. This document + `backend/models/` are the foundation everything else is built on._

## 1. High-level architecture

```
┌────────────────┐        HTTPS/JSON        ┌─────────────────┐
│   React SPA     │ ───────────────────────▶ │  Node/Express     │
│  (frontend/)    │ ◀─────────────────────── │  API (backend/)   │
│                 │        WebSocket          │                    │
│                 │ ◀────────────────────────▶│  Socket.IO         │
└────────────────┘                           └─────────┬──────────┘
                                                        │ REST (internal)
                                                        ▼
                                              ┌─────────────────────┐
                                              │  Python AI Service    │
                                              │  (ai-service/)        │
                                              │  FastAPI              │
                                              └─────────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────────┐
                                              │      MongoDB           │
                                              └─────────────────────┘
```

- The **frontend never talks to the AI service directly** — all AI calls are proxied through
  the Node backend (`backend/services/aiService.js`), so API keys / internal URLs never reach
  the browser and the backend stays the single source of truth for complaint state.
- The AI service is **stateless** — it receives complaint text/images, returns predictions, and
  never touches MongoDB directly. This keeps it swappable (mock logic today → real ML models later)
  without changing the Node backend's contract.
- **Socket.IO** runs on the same Node process as the REST API, authenticated via the same JWT,
  so real-time events (assignment, status change, escalation) reuse existing auth logic.

## 2. Backend folder structure

```
backend/
  config/          → db.js (Mongo connection), cloudinary.js, socket.js, constants.js
  controllers/      → thin HTTP handlers (req/res only) — one file per resource
  services/         → business logic (complaintService, slaService, aiService, notificationService...)
  models/           → Mongoose schemas (done in Phase 1 — see below)
  routes/            → Express routers, one per resource, mounted in server.js
  middleware/        → auth.js (JWT verify), rbac.js (role check), errorHandler.js, upload.js, rateLimiter.js
  validators/         → Zod schemas for request validation
  sockets/             → socket event handlers, room management (per-user, per-role rooms)
  utils/                → logger.js (Winston), seed.js (demo data), asyncHandler.js, apiResponse.js
  logs/                  → winston log output (gitignored)
  server.js               → app bootstrap
```

**Why controllers/services are separated:** controllers stay dumb (parse request → call service →
shape response); services hold logic that's reused across HTTP routes, sockets, and the seed script.
This is what lets SLA computation, AI-triggered auto-assignment, and escalation logic all share one
`complaintService` instead of being duplicated.

## 3. Frontend folder structure

```
frontend/src/
  components/    → shared, reusable UI (Button, Card, Badge, Modal, MapView, ComplaintCard, Skeletons...)
  pages/           → route-level pages, grouped by portal: public/, citizen/, authority/, admin/
  layouts/          → PublicLayout, CitizenLayout, AuthorityLayout, AdminLayout (nav differs per role)
  routes/            → AppRoutes.jsx, ProtectedRoute.jsx, RoleRoute.jsx
  redux/              → store.js + slices: authSlice, complaintSlice, notificationSlice, uiSlice
  api/                 → axios instance + per-resource API modules (authApi, complaintApi, adminApi...)
  hooks/                 → useAuth, useSocket, useGeolocation, useDebounce
  utils/                  → formatters, constants (status colors, SLA labels), statusMachine
  services/                → socketService.js (Socket.IO client singleton)
  styles/                   → tailwind.css, design tokens
```

## 4. AI service folder structure

```
ai-service/
  app/          → FastAPI app instance, config
  models/        → Pydantic request/response schemas
  services/       → prediction logic per capability (classification, severity, image_detection,
                     duplicate_detection, summarization) — each swappable for a real model later
  routes/          → endpoint routers (predict-complaint, detect-image, detect-duplicate, summarize, health)
  utils/            → mock inference helpers, keyword/heuristic engines used as placeholder "AI"
  main.py            → app entrypoint
```

## 5. Data models (Phase 1 — implemented)

| Model | Purpose |
|---|---|
| `User` | Citizens, authority officers, admins. Role-based extra fields for authority (department, designation, jurisdiction). |
| `Department` | Civic departments; maps complaint categories → responsible department; tracks performance stats. |
| `Complaint` | Core entity: location (GeoJSON, 2dsphere indexed), AI predictions, SLA fields, timeline, comments, resolution evidence, citizen verification loop. |
| `Notification` | Persisted, real-time-pushed notifications per user. |
| `AuditLog` | Immutable trail of sensitive actions (status overrides, user/department management, SLA/AI config changes). |
| `Assignment` | Full assignment/reassignment history per complaint (separate from `Complaint.assignedTo`, which is just current state) — powers workload analytics. |
| `Announcement` | Admin broadcast messages, targeted by audience, pushed via Socket.IO. |
| `Settings` | Singleton document for SLA rules, AI configuration, and general app settings — all admin-editable instead of hardcoded. |

### Key design decisions baked into the schema

- **GeoJSON + 2dsphere index** on `Complaint.location` — enables real "nearby complaints" and
  hotspot geo-queries (`$near`, `$geoWithin`) instead of naive lat/lng filtering.
- **SLA deadline computed in a pre-save hook** from `severity` × `Settings.slaRules` — so changing
  severity (by AI or officer) automatically recalculates the deadline instead of requiring manual sync.
- **`resolutionEvidence` is a required array, enforced at the service layer** (not just schema) —
  the controller for "mark resolved" explicitly rejects the request if evidence is empty, satisfying
  the hard requirement that officers cannot resolve without proof.
- **`ai` is a sub-object on Complaint, not a separate collection** — predictions are always read
  together with the complaint (dashboard cards, map popups), so embedding avoids an extra join;
  `duplicateCandidates` still references other complaints by ObjectId for flexibility.
- **`timeline` is embedded** (not a separate collection) because it's always read as a unit with the
  complaint and rarely queried independently — keeping complaint history reads to one query.
- **`Settings` is a singleton** — one document, upserted — so SLA/AI config changes take effect
  instantly across the app without a deploy, and are still fully audit-logged via `AuditLog`.

## 6. What's next (remaining phases)

1. Backend core: config, middleware (auth/rbac/error handling), utils, auth flow
2. Backend: complaint CRUD + SLA/escalation service logic
3. Backend: Socket.IO events + AI-service HTTP client
4. AI service: FastAPI app with mock-but-realistic inference
5. Frontend foundation: Tailwind design system (charcoal/emerald/mint/amber palette), routing, Redux store, API layer
6. Frontend: Landing page + Auth
7. Frontend: Citizen portal
8. Frontend: Authority portal
9. Frontend: Admin command center
10. Seed data, README, `.env.example` files, final wiring
