# Frontend Technical Handover

> Implementation-focused reference for developers taking over the **MIT WPU Student
> Portfolio** frontend. Everything below reflects the codebase at commit `baf5ff1`
> (release-candidate). No speculative or future behavior is described.

---

## 1. Tech stack

| Concern | Choice | Version |
|---|---|---|
| Framework | React (StrictMode) | 19.2 |
| Language | TypeScript | ~6.0 |
| Build tool | Vite (Rolldown) | 8.1 |
| Styling | Tailwind CSS **v4** via `@tailwindcss/vite` | 4.3 |
| Routing | `react-router-dom` | 7.x |
| Charts | `recharts` | 3.x |
| Icons | `lucide-react` | 1.x |
| HTTP | `axios` | 1.x |
| Linter | `oxlint` | 1.x |
| Animation | **None** — CSS-only motion system (see §9) | — |

There is **no** Redux/Zustand/React-Query, **no** Framer Motion, and **no** test framework.

## 2. Build & run

```bash
cd frontend
npm ci            # clean install (Node 18+)
npm run dev       # Vite dev server → http://localhost:5173
npm run build     # tsc -b && vite build  → dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

- Dev defaults to **mock mode** (`.env.development` sets `VITE_USE_MOCK=true`) — no backend needed to click through the app.
- Mock login credentials: repo-root [`passwords.md`](../passwords.md).

## 3. Repository & folder structure

Monorepo; the frontend lives entirely under `frontend/`.

```
frontend/
├── index.html
├── vite.config.ts            # react() + tailwindcss() plugins
├── tsconfig*.json
├── .env.development / .env.production
├── mock-api/                 # JSON fixtures loaded by the mock driver (import.meta.glob)
│   ├── students/  teacher/  admin/
└── src/
    ├── main.tsx              # createRoot → <ThemeProvider><App/>
    ├── App.tsx               # providers + RoleRouter (all routes)
    ├── index.css             # Tailwind import, @theme tokens, motion system, globals
    ├── api/
    │   ├── client.ts         # axios instance + interceptors (auth, 401)
    │   ├── endpoints.ts      # API route constants (single source of truth)
    │   ├── mock/             # USE_MOCK flag + in-memory mockDriver
    │   ├── contracts/        # request/response DTOs (per resource)
    │   ├── entities/         # domain models (User, Project, …)
    │   └── services/         # one module per resource; toggles mock vs apiClient
    ├── auth/                 # AuthContext, useAuth, ProtectedRoute, FirstLoginGuard
    ├── features/             # feature-based screens (see §5)
    └── shared/
        ├── ui/               # reusable UI kit (§7)
        ├── layout/           # AppLayout, Sidebar, Topbar, navigation/*
        ├── lib/              # id, useEscapeKey, useReveal
        ├── hooks/            # useSortableTable
        ├── providers/        # ThemeProvider
        └── permissions/      # roles + RBAC functions
```

**Design principle:** the `contracts / entities / services / mock` split means swapping mock
data for the real backend is a **single env flag** (`VITE_USE_MOCK`) — no screen code changes.

## 4. Routing

- `react-router-dom` v7 `BrowserRouter`. All routing is centralized in `src/App.tsx`.
- **`RoleRouter`** renders a **different `<Routes>` tree per role** (`student` / `teacher` / `admin`), read from `useAuth().user.role`. Public routes (`/login`, `/change-password`, `/forgot-password`, `/unauthorized`) are shared.
- Every private tree is wrapped in:
  - **`ProtectedRoute`** — redirects unauthenticated → `/login`, wrong-role → `/unauthorized`.
  - **`FirstLoginGuard`** — forces users with `firstLogin=true` to `/change-password`.
  - **`AppLayout`** — the sidebar + topbar shell (`<Outlet/>` for the page).
- **Student routes** are additionally wrapped in `AcademicProvider` + `ProjectsProvider`.
- Unknown paths within a role tree redirect to that role's index (`<Navigate to="/" replace/>`).

Provider nesting (outer→inner): `ThemeProvider` → `AuthProvider` → `Router` → `RoleRouter` → (per-role) context providers → `AppLayout`.

Full route table: [`ROUTES.md`](../ROUTES.md).

## 5. Feature modules (`src/features/`)

`academic`, `achievements`, `admin`, `analytics`, `auth`, `courses`, `dashboard`,
`experience`, `placement`, `profile`, `projects`, `research`, `skills`, `teacher`.

Each feature owns its screens, sub-components, local `types.ts`, and (where needed) a context.
Data always flows through `src/api/services/*`, never `axios` directly.

**Component hierarchy (typical page):**
`App` → `RoleRouter` → `ProtectedRoute` → `FirstLoginGuard` → `AppLayout` (`Sidebar` + `Topbar` + `<Outlet/>`) → **feature page** → feature sub-components → `shared/ui` primitives.

## 6. State management

Plain **React Context + hooks** (no external state lib):

| Context | Scope | Responsibility |
|---|---|---|
| `AuthContext` (`src/auth`) | app | Session (`user`, `isAuthenticated`, `firstLogin`), login/logout, `localStorage` persistence, boot-time rehydration via `GET /me`, inactivity-timeout logout. |
| `ThemeProvider` (`shared/providers`) | app | `theme` + `setTheme`. **Light-only** in practice (dark mode retired); the `'dark'` type lingers and a few charts still branch on `useTheme()`. |
| `AcademicContext` (`features/academic`) | student routes | Holds semesters (loaded via `getAcademicRecords`). Mutations are **in-memory only** — see §11. |
| `ProjectsContext` (`features/projects`) | student routes | Projects list + `add/update/delete/getProject` (these DO call the services). |

Everything else is component-local `useState`. Server data is fetched in `useEffect` on mount
per screen.

**Persistence keys** (`localStorage`): `mit_access_token`, `mit_refresh_token`,
`mit_mock_session` (persists `firstLogin`), `mitwpu-theme-2026` (theme).

## 7. Reusable UI kit (`src/shared/ui/`)

13 primitives, all Tailwind-token styled and design-system compliant:

`button` · `card` (+ `interactive` prop for hover-lift) · `input` · `textarea` · `select`
(styled native `<select>` with custom chevron) · `label` · `badge` · `modal`
(+ `DeleteConfirmModal`) · `progress` · `tabs` · `loading-skeleton` (shimmer) ·
`empty-state` · `Reveal` (scroll-reveal wrapper).

**Convention:** every dropdown uses `<Select>` (not raw `<select>`); every dialog uses `<Modal>`.
The `Modal` owns enter/exit animation, backdrop blur, Escape-to-close (`useEscapeKey`),
backdrop-click close, and delayed unmount.

## 8. Styling & design system

- **Tailwind v4**, configured entirely in CSS (`src/index.css`) — no `tailwind.config.js`.
- Tokens live in an `@theme { … }` block: semantic colors (`--color-primary`,
  `--color-surface`, `--color-on-surface`, …), radii, and the **"Academic Pulse"** palette
  (primary `#5545cd`, indigo/lavender surfaces). Typeface is **Hanken Grotesk** (loaded via
  Google Fonts in `index.html`). Token values are the exact Stitch design values.
  Full spec: [`DESIGN.md`](./DESIGN.md).
- Custom `@utility` helpers: `glass`, `glass-subtle`, `app-canvas`, plus the motion utilities (§9).
- **Always use semantic tokens** (`text-on-surface`, `bg-surface-container`, `border-outline-variant`)
  rather than raw Tailwind palette classes — this is what makes the theme swappable.
- Light-first; dark mode was intentionally removed in the redesign.

## 9. Animation (CSS-only motion system)

No JS animation library. All motion is defined in `src/index.css` and applied via classes.

- **Tokens:** `--dur-fast/base/slow`, easings `--ease-out-quart` / `--ease-spring` / `--ease-in-out`.
- **Keyframes:** `fadeIn`, `fadeInUp`, `scaleIn`, `modalIn/Out`, `shimmer`, `popIn`.
- **Utilities:** `page-enter` (route transition), `animate-fade-in/scale-in/pop`, `stagger-in`
  (cascade direct children), `.reveal`/`.is-visible` (scroll reveal via `useReveal` +
  IntersectionObserver), `.press` (tactile active-scale), `.hover-lift`, `.shimmer`,
  `.modal-backdrop`/`.modal-panel` (+ `-out` exit variants).
- **Accessibility:** a `prefers-reduced-motion` block disables animation **without hiding
  content** (reveal/stagger elements are forced visible).

> ⚠️ **Critical gotcha for future devs:** entrance utilities on **route/section containers**
> must use `animation-fill-mode: backwards`, **never `both`/`forwards`**, and must not leave a
> lingering `will-change: transform`. A retained transform turns the container into the
> containing block for `position:fixed` children, which **mis-centers every modal/overlay** on
> tall pages. This was hit and fixed once already (`page-enter`, `.reveal`).

## 10. API integration flow

1. Screen calls a typed function from `src/api/services/<resource>.ts`.
2. The service checks `USE_MOCK`:
   - **mock** → returns data from `mockDriver` (in-memory, seeded from `mock-api/*.json`) after a simulated delay.
   - **real** → calls the shared `apiClient` (axios) against `endpoints.ts` routes.
3. `apiClient` request interceptor attaches the JWT; response interceptor handles `401`.
4. Types come from `contracts/` (DTOs) and `entities/` (models).

See [`FRONTEND_API_CONTRACT.md`](./FRONTEND_API_CONTRACT.md) for the exact endpoint list and
which calls are mock-backed vs backend-only.

## 11. Known limitations & technical debt

**Requires backend (no mock branch — non-functional in mock mode):**
- `PATCH /me/profile` (profile editing), `POST /me/upload` (image upload),
  `PATCH /teacher/guidance-cases/:id`, all `POST /admin/import/*` bulk imports.

**Unwired / dead-ish code:**
- **Academic writes:** `AcademicContext.addSemester/updateSemester/deleteSemester` mutate only
  local state (their comments claim a backend call, but none is made). The `academic` service's
  `create/update/deleteSemester` and `AddSemesterModal.tsx` are **not called/rendered anywhere** —
  academic records are read-only for students (populated via admin import; `canEditRecords` is admin-only).
- `features/dashboard/AdminDashboard.tsx` appears to be a **legacy** admin dashboard; the routed
  admin dashboard is `features/admin/pages/AdminDashboard.tsx`. The former is effectively unreachable.
- Service functions `POST /auth/logout`, `POST /auth/refresh`, `getAdminDashboard()` are defined but never invoked.

**Behavioral debt:**
- **No token-refresh flow** — a `401` logs the user out; `/auth/refresh` is never called.
- Mock driver mutations are **in-memory** and reset on page reload.
- Some form modals generate ids with `Math.random()` (`shared/lib/id.ts`); the server/driver
  authoritatively re-assigns ids on create (client ids are discarded).
- `firstLogin` is persisted via `mit_mock_session` even in non-mock mode (minor coupling to the mock key name).
- `ThemeProvider` still carries the `'dark'` type and a few charts branch on `useTheme()` despite the app being light-only.

**Performance:**
- Single JS bundle ≈ **986 kB** minified (≈ 270 kB gzip), driven largely by `recharts`. Vite
  emits a chunk-size warning. **No route-level code-splitting** is in place.

**Quality:**
- No automated tests. `oxlint` passes with a few non-blocking warnings
  (`only-export-components` on the two context files; one `no-unused-expressions`).

## 12. Areas for future improvement

- Route-based lazy loading (`React.lazy` / dynamic `import()`) to split the bundle, esp. `recharts` pages.
- Implement the silent token-refresh flow around `/auth/refresh`.
- Wire (or remove) the academic-records write path and `AddSemesterModal`; delete the legacy `features/dashboard/AdminDashboard.tsx`.
- Add mock branches for the four backend-only endpoints so the full app is demoable offline, **or** stand up the backend.
- Introduce a data-fetching layer (e.g. React Query) to replace ad-hoc `useEffect` fetches and add caching/retries.
- Add a test suite (component + a few E2E happy paths).

## 13. Important implementation decisions (why things are the way they are)

- **Mock-first architecture.** `contracts/entities/services/mock` split + `USE_MOCK` flag lets
  the whole UI be built and demoed with zero backend, then flipped to real APIs without touching screens.
- **CSS-first motion (no Framer Motion).** Chosen for zero bundle cost, trivial
  `prefers-reduced-motion` support, and consistency; hits the intended "subtle, premium" bar
  without a dependency.
- **Feature-based structure + shared UI kit.** Screens stay thin; polish (micro-interactions,
  modals, dropdowns) lives in `shared/ui` so it propagates app-wide from one place.
- **RBAC via `permissions.ts` functions** (`canEditProfile(role)`, `canManageCohorts(role)`, …)
  rather than inline role checks — centralizes access logic and eases backend migration.
- **Light-only redesign.** Dark mode was removed to commit fully to the Academic Pulse light palette.

---

_Maintained by the **iGNISIA Tech Team**. Keep this file in sync with the code — if you change
routing, the API layer, or the motion system, update the relevant section above._
