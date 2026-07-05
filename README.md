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

The UI implements the **Luminous Academic** design system — see `docs/DESIGN.md`
for tokens (colors, typography, spacing, radii, glassmorphism) and component specs.

---

Built by **iGNISIA Tech Team**
