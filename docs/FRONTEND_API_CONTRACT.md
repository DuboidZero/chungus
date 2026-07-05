# Frontend API Contract (Implementation-Derived)

> **Provenance:** This document is generated **strictly from the current frontend code**
> (`frontend/src/api/`). It lists every endpoint the SPA actually calls, the exact HTTP
> verb, request/response shapes (from `contracts/` + `entities/`), and — critically — which
> calls have a working mock implementation versus which currently **require backend support**.
>
> For the backend team's hand-authored target spec, see [`API_CONTRACT.md`](./API_CONTRACT.md),
> [`TEACHER_CONTRACT.md`](./TEACHER_CONTRACT.md), [`ADMIN_CONTRACT.md`](./ADMIN_CONTRACT.md).
> Where the two disagree, **this file reflects what the code does today.**
>
> Nothing here is invented — items the frontend defines but never calls, or calls without a
> mock, are explicitly flagged rather than assumed to work.

- **Last derived from commit:** `baf5ff1` (release-candidate QA pass)
- **Base URL:** `import.meta.env.VITE_API_BASE_URL` → falls back to `http://localhost:8000/api/v1`
  (production env: `https://api.mitwpu-portfolio.edu.in/api/v1`)
- **Transport:** `axios` singleton (`src/api/client.ts`), 15 s timeout
- **Default headers:** `Content-Type: application/json`, `Accept: application/json`
- **Timestamps:** all `createdAt`/`updatedAt`/date fields are ISO-8601 strings

---

## Legend — mock status

| Symbol | Meaning |
|---|---|
| 🟢 **Mocked + Real** | Has a `USE_MOCK` branch (works offline) **and** a real `apiClient` call. Backend must implement the real path. |
| 🔵 **Real only** | Only calls `apiClient` — **no mock branch**. Non-functional while `VITE_USE_MOCK=true`; needs backend to exercise. |
| ⚪ **Defined, not invoked** | Endpoint constant and/or service function exists but **no screen calls it**. Documented for completeness; not a live dependency. |

`VITE_USE_MOCK=true` (the dev default) short-circuits all 🟢 calls to an in-memory driver
(`src/api/mock/mockDriver.ts`) and **never touches the network**.

---

## Authentication & session

Auth is JWT bearer-token based.

- On login the frontend stores `accessToken` + `refreshToken` in `localStorage`
  (`mit_access_token`, `mit_refresh_token`) plus a `mit_mock_session` blob (used to persist
  the `firstLogin` flag across refreshes).
- **Request interceptor** injects `Authorization: Bearer <mit_access_token>` on every request.
- **Response interceptor**: on any `401` (except `/auth/login` and `/auth/forgot-password`)
  it clears all tokens and hard-redirects to `/login`.
- ⚠️ **There is no automatic token-refresh flow.** Despite `POST /auth/refresh` being defined,
  the interceptor does **not** call it — a 401 simply logs the user out. See _Known gaps_.
- Client-side inactivity timeout (`useInactivityTimeout`) also triggers logout.

### `POST /auth/login` — 🟢
- **Auth:** none
- **Request:** `{ identifier: string, password: string }` — `identifier` is a **PRN** (students) or **email** (faculty/admin)
- **Response `200`:** `{ user: User, accessToken: string, refreshToken: string, firstLogin: boolean }`
- **Errors:** `401` invalid credentials (surfaced as inline form error). The response interceptor deliberately ignores 401s from this route.

### `POST /auth/forgot-password` — 🟢
- **Auth:** none · **Request:** `{ identifier: string }` · **Response `200`** (no body used)
- _Route is a string literal in `services/auth.ts`, not in `endpoints.ts`._

### `POST /auth/change-password` — 🟢
- **Auth:** required · **Request:** `{ currentPassword: string, newPassword: string }` · **Response `200`**
- Used by `ChangePasswordPage`; the `FirstLoginGuard` forces first-login users here.

### `GET /me` — 🟢
- **Auth:** required · **Response `200`:** `User`
- Called on app boot (non-mock mode) to rehydrate the session from a stored token.

### `POST /auth/logout` — ⚪
- Defined in `services/auth.ts` but **not invoked**. The UI logout (`AuthContext.logout`) is purely client-side (clears `localStorage`). Backend may implement server-side logout/token revocation; the frontend does not currently call it.

### `POST /auth/refresh` — ⚪
- Defined (`services/auth.ts`, `endpoints.ts`) with `{ refreshToken }` → `{ accessToken, refreshToken }`, but **never called**. No silent-refresh is wired.

---

## Student — `/me/*` resources

All require auth. `User` is the caller (role `student`).

### Dashboard
**`GET /me/dashboard`** — 🟢 → `StudentDashboardResponse`
```ts
StudentDashboardResponse = {
  stats: { cgpa, percentage, totalCredits, projectCount, achievementCount, skillCount },
  cgpaTrend: { semester: string, cgpa: number|null, projected: number|null }[],
  upcomingDeadlines: Deadline[]   // { id, title, subject, dueDate, urgencyLabel, urgency: 'urgent'|'normal' }
}
```
> When a **teacher** views a student, the same UI calls `GET /teacher/students/:id/overview` instead (see teacher section).

### Profile
- **`GET /me/profile`** — 🟢 → `Profile`
- **`PATCH /me/profile`** — 🔵 **Real only (no mock)** → `Profile`
  - **Request** `UpdateProfileRequest`: `{ avatarUrl?, aboutMe?, phone?, location?, internshipPreference?, preferredRadius? }`
  - ⚠️ Editing/saving the profile is **non-functional in mock mode** — requires backend.

```ts
Profile = {
  id, userId, avatarUrl?, aboutMe, email, phone, location,
  internshipPreference: 'online'|'offline'|'none',
  preferredRadius, domainInterest?, createdAt, updatedAt
}
```

### Academic records
- **`GET /me/academic-records`** — 🟢 → `Semester[]`
- **`POST /me/academic-records`**, **`PATCH /me/academic-records/:id`**, **`DELETE /me/academic-records/:id`** — ⚪ **Defined but NOT invoked by any screen.**
  - The service functions (`createSemester`/`updateSemester`/`deleteSemester`) and contracts exist, but **no student screen calls them** — the Academic Records page is **read-only** (`canEditRecords` is admin-only; records are populated via Admin bulk import). `AddSemesterModal.tsx` exists but is not rendered anywhere.
  - If the backend implements these, they are currently unused by the UI.

```ts
Semester = { id, semesterNumber, gpa, totalCredits, subjects: SubjectMark[], createdAt, updatedAt }
SubjectMark = { id, name, marksObtained, maxMarks, grade, credits }
```

### Skills
- **`GET /me/skills`** — 🟢 → `{ technical: TechnicalSkill[], soft: SoftSkill[], languages: LanguageSkill[] }`
- **`POST /me/skills/technical`** — 🟢 → `TechnicalSkill` · Request `{ domain, name, proficiency: number(1-5) }`
- **`POST /me/skills/soft`** — 🟢 → `SoftSkill` · Request `{ name, proficiency?: number(1-5) }`
- **`POST /me/skills/languages`** — 🟢 → `LanguageSkill` · Request `{ name, proficiency: 'Basic'|'Conversational'|'Proficient'|'Fluent'|'Native' }`
- **`DELETE /me/skills/:type/:id`** — 🟢 → `204` · `:type` ∈ `technical|soft|languages`

```ts
TechnicalSkill = { id, domain, name, proficiency: number }   // 1..5
SoftSkill      = { id, name, proficiency?: number }
LanguageSkill  = { id, name, proficiency: LanguageProficiency }
```

### Projects
- **`GET /me/projects`** — 🟢 → `Project[]`
- **`GET /me/projects/:id`** — 🟢 → `Project`
- **`POST /me/projects`** — 🟢 → `Project` · Request `CreateProjectRequest`
- **`PATCH /me/projects/:id`** — 🟢 → `Project` · Request `UpdateProjectRequest` (all fields optional)
- **`DELETE /me/projects/:id`** — 🟢 → `204`

```ts
CreateProjectRequest = {
  name, description, domain, techStack: string[], imageUrl?,
  type: 'College Project'|'Personal Project'|'Internship Project',
  mentorName?, status: 'Ongoing'|'Completed', startDate?, endDate?
}
Project = CreateProjectRequest & {
  id, mentorId?, githubRepo?, createdAt, updatedAt
}
```
> **Backend note:** the canonical field names are `name` / `domain` / `type`. (The demo fixtures historically used `title`/`category`; the mock driver normalizes them, but the real API should return `name`/`domain`/`type`.) Image URLs come from `POST /me/upload` (below).

### Work experience
- **`GET /me/experience`** — 🟢 → `Experience[]`
- **`POST /me/experience`** — 🟢 → `Experience` · Request `{ organisationName, role, startDate, endDate?, description, type }`
- **`PATCH /me/experience/:id`** — 🟢 → `Experience` (all fields optional; `endDate` nullable)
- **`DELETE /me/experience/:id`** — 🟢 → `204`

```ts
Experience = { id, organisationName, role, startDate, endDate?, description,
               type: 'Internship'|'Part-time'|'Full-time', createdAt, updatedAt }
```

### Achievements
- **`GET /me/achievements`** — 🟢 → `Achievement[]`
- **`POST /me/achievements`** — 🟢 → `Achievement` · Request below
- **`PATCH /me/achievements/:id`** — 🟢 → `Achievement` (all optional)
- **`DELETE /me/achievements/:id`** — 🟢 → `204`

```ts
CreateAchievementRequest = {
  title, description,
  category: 'Academic'|'Co-curricular'|'Sports'|'Technical'|'Cultural'|'Other',
  type: 'Competition'|'Hackathon'|'Award'|'Certification'|'Publication'|'Other',
  level: 'College'|'State'|'National'|'International',
  date, certificateUrl?
}
Achievement = CreateAchievementRequest & { id, createdAt, updatedAt }
```

### File upload
**`POST /me/upload`** — 🔵 **Real only (no mock)**
- **Request:** `multipart/form-data`, field `file`
- **Response `200`:** `{ url: string }` (backend stores the file, e.g. Supabase, and returns the public URL)
- Used by the project image picker. ⚠️ Non-functional in mock mode.

---

## Teacher — `/teacher/*` resources

All require auth (role `teacher`). Entities defined in `entities/teacher.ts`.

| Method & Route | Mock | Response |
|---|---|---|
| `GET /teacher/dashboard` | 🟢 | `TeacherDashboardResponse` (stats, supportNeeded, guidanceCases, charts) |
| `GET /teacher/students` (query: filters) | 🟢 | `{ students: StudentSummary[], ... }` |
| `GET /teacher/students/:id` | 🟢 | `{ id, name, prn, role, avatar? }` |
| `GET /teacher/students/:id/overview` | 🟢 | `StudentOverviewResponse` |
| `GET /teacher/students/:id/timeline` (query: `type`,`from`,`to`) | 🟢 | `StudentTimelineResponse` |
| `GET /teacher/students/:id/notes` | 🟢 | `PrivateNote[]` |
| `POST /teacher/students/:id/notes` | 🟢 | `PrivateNote` · Request `{ content: string }` |
| `PATCH /teacher/students/:id/notes/:noteId` | 🟢 | `PrivateNote` · Request `{ content: string }` |
| `DELETE /teacher/students/:id/notes/:noteId` | 🟢 | `204` |
| `GET /teacher/students/:id/marks` | 🟢 | `AssessmentMark[]` |
| `POST /teacher/students/:id/marks` | 🟢 | `AssessmentMark` |
| `GET /teacher/marks` | 🟢 | `(AssessmentMark & { studentName, studentPrn })[]` |
| `GET /teacher/students/:id/projects` | 🟢 | `Project[]` |
| `GET /teacher/projects` | 🟢 | `(Project & { studentName, studentPrn })[]` |
| `GET /teacher/projects/:id` | 🟢 | `Project` |
| `GET /teacher/projects/:id/marks` | 🟢 | `AssessmentMark[]` |
| `POST /teacher/projects/:id/marks` | 🟢 | `AssessmentMark` |
| `GET /teacher/projects/:id/milestones` | 🟢 | `ProjectMilestone[]` |
| `POST /teacher/projects/:id/milestones` | 🟢 | `ProjectMilestone` |
| `PATCH /teacher/guidance-cases/:id` | 🔵 **Real only** | `GuidanceCase` · Request `UpdateGuidanceCaseRequest` |

> `PATCH /teacher/guidance-cases/:id` has **no mock branch** — updating a guidance case requires backend.
> Routes `…/notes/:noteId` and `GET /teacher/marks` are string literals in `services/teacher.ts`, not in `endpoints.ts`.

```ts
StudentSummary = { id, prn, name, cgpa, performanceTier, guidanceStatus, lastInteractionDate, avatar? }
PrivateNote    = { id, studentId, teacherId, teacherName, content, createdAt, updatedAt }
AssessmentMark = { id, studentId, projectId?, assessmentTitle, score, maxScore, comments, teacherId, teacherName, date, createdAt, updatedAt }
ProjectMilestone = { id, projectId, description, status: 'On Track'|'Delayed'|'Completed', date, createdAt, updatedAt }
GuidanceCase   = { id, studentId, studentName, studentPrn, studentCgpa, triggerSignal, owningTeacherId, owningTeacherName, status, resolutionNote?, dateOpened, dateResolved?, createdAt, updatedAt }
```

---

## Admin — `/admin/*` resources

All require auth (role `admin`).

| Method & Route | Mock | Notes |
|---|---|---|
| `GET /admin/cohorts` | 🟢 | → `Cohort[]` |
| `PATCH /admin/cohorts/:id` | 🟢 | Request `{ academicMentorId: string \| null }` → `Cohort` |
| `GET /admin/users-list?role=student\|teacher` | 🟢 | → `User[]`. Frontend maps `isActive` → `deactivated` (`deactivated = !isActive`). |
| `PATCH /admin/users/:id` | 🟢 | → `User` (literal route) |
| `POST /admin/users/:id/reset-password` | 🟢 | → `{ temporaryPassword: string }` (literal route) |
| `POST /admin/users/:id/toggle-status` | 🟢 | → `User` (literal route) |
| `POST /admin/import/students` | 🔵 **Real only** | multipart `file` → `{ created, skipped, errors[] }` |
| `POST /admin/import/academic-records` | 🔵 **Real only** | multipart `file` → `{ created, skipped, errors[] }` |
| `POST /admin/import/skills` | 🔵 **Real only** | multipart `file` → `{ created, skipped, errors[] }` |
| `POST /admin/import/projects` | 🔵 **Real only** | multipart `file` → `{ created, skipped, errors[] }` |
| `POST /admin/import/achievements` | 🔵 **Real only** | multipart `file` → `{ created, skipped, errors[] }` |
| `POST /admin/import/work-experience` | 🔵 **Real only** | multipart `file` → `{ created, skipped, errors[] }` |
| `GET /admin/dashboard` | ⚪ **Defined, not invoked** | `getAdminDashboard()` exists but no screen calls it — the Admin Dashboard composes its stat cards **client-side** from `GET /admin/users-list` + `GET /admin/cohorts`. |

```ts
Cohort = { id, academicYear: 'FY'|'SY'|'TY'|'Final Year', department, studentCount,
           academicMentorId?, academicMentorName? }
```

**Bulk import responses:** the frontend reads `{ created?: number, skipped?: number, errors?: any[] }`
and renders a summary string ("Imported N row(s). M skipped. K row(s) had errors."). Missing keys
default to `0`/`[]`, so a minimal `{ created, skipped }` is acceptable.

---

## Other

**`GET /health`** — ⚪ Endpoint constant exists; **not called** by the frontend.

---

## Validation rules enforced client-side

These are the validations the UI applies **before** sending requests (the backend should
re-validate authoritatively):

- **Login:** both fields required.
- **Change password:** new password checked against `passwordValidation.ts` rules (length/complexity) before submit.
- **Project create/edit:** `name` required, `domain` required, `techStack` ≥ 1 item, `endDate` ≥ `startDate`; project image ≤ **2 MB**, JPG/PNG only (enforced before `POST /me/upload`).
- **Description fields** are length-capped in the UI (e.g. project description 300 chars).

## Expected status codes (frontend assumptions)

- `200` success with body · `204` for deletes (frontend ignores delete response bodies)
- `401` → global logout + redirect (except login/forgot-password)
- Other `4xx/5xx` → caught per-call; surfaced as inline errors or `console.error`. The frontend does **not** depend on a specific error-body shape, though login reads `err.response.data.message` when present.

## Known gaps / requires-backend summary

Endpoints the frontend depends on that **cannot be exercised in mock mode** (🔵) — backend must implement for these features to work end-to-end:

1. `PATCH /me/profile` — profile editing
2. `POST /me/upload` — project image upload
3. `PATCH /teacher/guidance-cases/:id` — guidance-case updates
4. `POST /admin/import/*` (6 routes) — all bulk CSV/XLSX imports

Defined-but-unused (⚪), safe to deprioritize until wired: `POST /auth/logout`,
`POST /auth/refresh`, `GET /admin/dashboard`, `GET /health`, and the
`/me/academic-records` write endpoints.
