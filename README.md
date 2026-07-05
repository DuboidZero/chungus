# Student Portfolio Project

A unified portal for student performance & portfolios at MIT WPU — students build
academic portfolios (skills, projects, experience, achievements), teachers monitor
and guide their cohorts, and admins manage users and bulk imports.

## Repository layout

```
├── frontend/   # React 19 + TypeScript + Vite + Tailwind v4 SPA
│   ├── src/           # application code (features/, shared/, api/, auth/)
│   ├── mock-api/      # JSON fixtures consumed by the mock driver
│   └── public/        # static assets
├── backend/    # FastAPI service
└── docs/       # API contracts & design docs
```

## Frontend

```bash
cd frontend
npm ci
npm run dev      # dev server on http://localhost:5173
npm run build    # typecheck + production build
npm run lint     # oxlint
```

The frontend runs against mock data by default (see `frontend/src/api/mock/`);
mock login credentials are listed in `passwords.md`. Environment configuration
lives in `frontend/.env.development` / `frontend/.env.production`.

## Backend

See `backend/` for the FastAPI service and its own setup instructions.

## Design

The UI implements the **Academic Pulse** design system (Stitch) — see `docs/DESIGN.md`
for tokens (colors, Hanken Grotesk typography, spacing, radii) and component specs.

## Documentation (`docs/`)

| File | Purpose |
|---|---|
| [`FRONTEND_API_CONTRACT.md`](docs/FRONTEND_API_CONTRACT.md) | **Implementation-derived** API reference — every endpoint the frontend calls, verbs, schemas, and which need backend support. Start here for integration. |
| [`FRONTEND_HANDOVER.md`](docs/FRONTEND_HANDOVER.md) | Technical handover — structure, routing, state, UI kit, motion system, known limitations, build/run. |
| [`API_CONTRACT.md`](docs/API_CONTRACT.md) · [`TEACHER_CONTRACT.md`](docs/TEACHER_CONTRACT.md) · [`ADMIN_CONTRACT.md`](docs/ADMIN_CONTRACT.md) | Backend team's target API spec (aspirational). |
| [`DESIGN.md`](docs/DESIGN.md) | Academic Pulse design system (Stitch tokens + typography). |
| [`instructions.md`](docs/instructions.md) | Local setup steps. |

---

Built by **iGNISIA Tech Team**
