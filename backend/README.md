# Polytechnic Portfolio System — Backend Development Notes

Internal reference for backend engineers working on the Polytechnic Portfolio System (MIT WPU, SRS v1.2).
Tracks project structure, setup, commands, database schema, and progress. Keep it updated as new modules are added.

> All backend code lives in the `backend/` folder of the `Student-Portfolio-Project` repo.
> All API routes are served under the **`/api/v1`** prefix (per the frontend API contract).

---

## 1. Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Language | Python 3.14 | — |
| Web framework | FastAPI | REST API + auto `/docs` |
| ASGI server | Uvicorn | Runs the app |
| ORM | SQLAlchemy 2.0 | Tables as Python classes |
| Migrations | Alembic | Versioned schema changes |
| Password hashing | bcrypt (direct) | passlib was dropped (version conflict) |
| Tokens | python-jose | JWT create/decode |
| Form parsing | python-multipart | needed for the `/docs` Authorize button |
| Config | python-dotenv | Loads secrets from `.env` |
| **Dev database** | **SQLite** (`portfolio.db`) | Current local dev DB — no Docker needed |
| **Prod target** | **PostgreSQL 16** (Docker) | `docker-compose.yml` ready; switch via `.env` |

> **Database note:** We are temporarily on **SQLite** for local development because Docker
> was failing to start on the dev machine. The code is database-agnostic — switching back to
> PostgreSQL is a one-line `.env` change (see section 6) plus `alembic upgrade head`. UUID ids are
> stored as `String(36)` so they work identically on both SQLite and Postgres.

---

## 2. Prerequisites

- Python 3.11+ (we use 3.14)
- Git
- (Optional, for Postgres) Docker Desktop — running

```powershell
python --version
git --version
```

---

## 3. Project Structure

```
backend/
├── .venv/                  # virtual environment (gitignored)
├── .env                    # DATABASE_URL, SECRET_KEY (gitignored — NEVER commit)
├── .env.example            # template of required env vars (committed)
├── .gitignore
├── portfolio.db            # SQLite dev database (gitignored)
├── main.py                 # app entrypoint: CORS, /api/v1 prefix, includes all routers
├── requirements.txt        # pinned dependencies
├── docker-compose.yml      # PostgreSQL 16 (for switching to Postgres)
├── alembic.ini
├── alembic/
│   ├── env.py              # loads DATABASE_URL + imports every model
│   └── versions/           # migration recipe files (the schema history)
└── app/
    ├── database.py         # engine, SessionLocal, Base, TimestampMixin
    ├── core/
    │   ├── security.py     # hash/verify password, JWT create/decode
    │   ├── dependencies.py # get_db, get_current_user (the auth gate), oauth2_scheme
    │   └── grading.py      # MIT WPU grade points + SGPA/CGPA calculation
    ├── models/             # DATABASE side — one file per resource
    │   ├── user.py         # User
    │   ├── profile.py      # Profile
    │   ├── achievement.py  # Achievement
    │   ├── experience.py   # Experience
    │   ├── project.py      # Project
    │   ├── skill.py        # TechnicalSkill, SoftSkill, Language
    │   └── academic.py     # Semester, Subject
    ├── schemas/            # API side — request/response shapes (Pydantic)
    │   ├── base.py         # CamelModel (snake_case <-> camelCase auto-conversion)
    │   ├── auth.py  profile.py  achievement.py  experience.py
    │   ├── project.py  skill.py  academic.py  dashboard.py
    └── routes/             # ENDPOINTS — one router per feature
        ├── auth.py  profile.py  achievement.py  experience.py
        ├── project.py  skill.py  academic.py  dashboard.py
```

### Layer roles (what a request touches)
- **`routes/`** — the endpoints (URLs + verbs).
- **`schemas/`** — validates incoming JSON, shapes outgoing JSON. Hides DB-only fields (e.g. password hash).
- **`models/`** — the database tables.
- **`core/`** — shared tools reused everywhere (security, the auth gate, grading).
- **`database.py`** — engine + per-request session + `Base`.

All schemas inherit **`CamelModel`** (`app/schemas/base.py`) so Python stays `snake_case` while the
API speaks `camelCase` (e.g. `about_me` <-> `aboutMe`).

---

## 4. First-Time Setup (new engineer)

```powershell
cd Student-Portfolio-Project/backend

# venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1          # look for (.venv) on the prompt

# deps
pip install -r requirements.txt

# env
copy .env.example .env                # then fill in SECRET_KEY (and DATABASE_URL)

# create the tables
alembic upgrade head

# run
uvicorn main:app --reload
```

- API docs / test console: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/api/v1/health`

> **PowerShell blocks the activate script?** Run once:
> `Set-ExecutionPolicy -Scope CurrentUser -RemoteSigned`

---

## 5. Daily Workflow

```powershell
cd Student-Portfolio-Project/backend
.\.venv\Scripts\Activate.ps1          # re-activate every new terminal
uvicorn main:app --reload
```

The venv must be re-activated per terminal session. SQLite needs nothing else running.

---

## 6. Environment Variables (`.env`)

```
DATABASE_URL=sqlite:///./portfolio.db
SECRET_KEY=<long random string — generate with the command below>
```

Generate a secret key locally (never paste it anywhere shared):
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

**To switch to PostgreSQL** (when Docker works):
```
DATABASE_URL=postgresql+psycopg2://portfolio:portfolio@localhost:5432/portfolio
```
…then `docker compose up -d` and `alembic upgrade head`. No code changes — the migrations build
the identical schema in Postgres.

> `.env` is **gitignored** (holds the secret key + DB password). `.env.example` documents the keys
> with placeholder values and IS committed.

---

## 7. Authentication

- **Login:** students by **PRN**, staff by **email** (both stored on `users`, one used per role).
- **Passwords:** hashed with **bcrypt** (never stored plain). `app/core/security.py`.
- **Tokens:** JWT (python-jose), signed with `SECRET_KEY`, **30-min expiry**. Carry `sub` (user id) + `role`.
- **The auth gate:** `get_current_user` in `app/core/dependencies.py` — reads the token, finds the
  user, and is used by **every protected endpoint**. The user id always comes from the token, never
  the URL, so a user can only ever touch their own data.
- **First login:** seeded students have `must_change_password = True`; login returns
  `mustChangePassword` so the frontend can force a change via `POST /auth/change-password`.

### `/docs` Authorize button
Click **Authorize**, enter a student's PRN as username + password (leave client fields blank).
Backed by a hidden `POST /auth/token` helper so the docs console can attach the token automatically.

---

## 8. Database Schema

UUID ids stored as `String(36)`. Every table has `created_at` / `updated_at` (from `TimestampMixin`).
Ownership is via foreign keys: most tables -> `users.id`; `subjects` -> `semesters.id`.

| Table | Owner FK | Key columns |
|-------|----------|-------------|
| `users` | — | role, prn (unique), email (unique), hashed_password, must_change_password, is_active |
| `profiles` | user_id (unique) | avatar, about_me, email, phone, location, internship_preference, preferred_radius |
| `achievements` | user_id | title, description, category, type, level, date, certificate_url |
| `experiences` | user_id | organisation_name, role, start_date, end_date, description, type |
| `projects` | user_id | name, description, domain, tech_stack (JSON list), image_url, type, mentor_name, status, start_date, end_date, github_repo |
| `technical_skills` | user_id | domain, name, proficiency (int 1–5) |
| `soft_skills` | user_id | name, proficiency (int, nullable) |
| `languages` | user_id | name, proficiency (text: Basic…Native) |
| `semesters` | user_id | semester_number  (gpa + total_credits are **computed**, not stored) |
| `subjects` | semester_id | name, marks_obtained, max_marks, grade, credits |

> `profiles.user_id` is **unique** (one profile per user). All other owner FKs are non-unique
> (a user has many achievements, projects, etc.).

---

## 9. Grading System (`app/core/grading.py`)

MIT WPU 10-point scale.

| Letter | O | A+ | A | B+ | B | C | P | F |
|--------|---|----|----|----|----|----|----|----|
| Points | 10 | 9 | 8 | 7 | 6 | 5 | 4 | 0 |

- **SGPA** (per semester) = Sum(credits × grade_points) / Sum(credits)
- **CGPA** (cumulative) = Sum(all credit-points across all semesters) / Sum(all credits)
- Grade points come from the letter grade; if only marks are given, marks % -> letter -> points.
- GPA/CGPA are **computed on read**, never stored (so they can't drift).

> Note: in the dashboard contract, each `cgpaTrend` point is named `cgpa` but is actually the
> **SGPA** for that semester. Flagged to frontend (see Open Questions). `stats.cgpa` is the true
> cumulative CGPA.

---

## 10. API Endpoints (all under `/api/v1`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | health + timestamp |
| POST | `/auth/login` | PRN/email login -> user + token + mustChangePassword |
| POST | `/auth/change-password` | first-login / self-service change |
| GET | `/auth/me` | current user |
| GET / PATCH | `/me/profile` | view / edit profile |
| GET / POST | `/me/achievements` | list / create |
| PATCH / DELETE | `/me/achievements/{id}` | edit / remove |
| GET / POST | `/me/experience` | list / create |
| PATCH / DELETE | `/me/experience/{id}` | edit / remove |
| GET / POST | `/me/projects` | list / create |
| PATCH / DELETE | `/me/projects/{id}` | edit / remove |
| GET | `/me/skills` | grouped: { technical, soft, languages } |
| POST | `/me/skills/technical` · `/soft` · `/languages` | add a skill |
| DELETE | `/me/skills/{type}/{id}` | remove a skill |
| GET / POST | `/me/academic-records` | list / create semester (+subjects), GPA computed |
| DELETE | `/me/academic-records/{id}` | remove a semester |
| GET | `/me/dashboard` | stats (cgpa + counts) + cgpaTrend + upcomingDeadlines |

---

## 11. Adding a New Module (the repeatable rhythm)

1. **Model** in `app/models/<name>.py` (inherit `Base, TimestampMixin`).
2. **Import it in `alembic/env.py`** (or autogenerate won't see the table).
3. `alembic revision --autogenerate -m "create <name> table"` -> **read the file** -> `alembic upgrade head`.
4. **Schemas** in `app/schemas/<name>.py` (inherit `CamelModel`): Create / Update / Response.
5. **Routes** in `app/routes/<name>.py` — protect with `Depends(get_current_user)`, scope every
   query by `user_id == current_user.id`.
6. **Wire into `main.py`:** `from app.routes import <name>` + `app.include_router(<name>.router, prefix="/api/v1")`.
7. Test in `/docs`.

---

## 12. Migrations (Alembic)

```powershell
alembic revision --autogenerate -m "describe change"   # write recipe (read it before applying)
alembic upgrade head                                    # apply
alembic downgrade -1                                    # roll back last
```

- One migration file = **one change** (can span multiple tables). They form a chain (`down_revision`).
- Never drop-and-recreate a table that holds real data — use expand-and-contract (add -> backfill ->
  switch -> drop). Drop-and-recreate is only safe while the DB is empty (dev).

---

## 13. Git Workflow

- Backend lives in `backend/`; never touches the frontend's `src/`.
- Work on a feature branch; PR into the shared branch. `git pull` before `git push` (shared branch).
- Commit messages: `feat:` / `fix:` / `chore:`.

```powershell
git status                 # what's staged (confirm no .env / portfolio.db / test_*.py)
git pull
git add .
git commit -m "feat: ..."
git push
```

---

## 14. Progress Log

| Date | Work done |
|------|-----------|
| 2026-06-28 | Foundation: FastAPI server + `/health`; Postgres-in-Docker setup; SQLAlchemy connection; `User` model + first migration. |
| 2026-06-28 | Switched dev DB to **SQLite** (Docker wouldn't start). Moved ids to **UUID** + timestamps to match contract. |
| 2026-06-28 | **Auth** complete: bcrypt hashing, JWT, login, `/me`, change-password, `get_current_user` gate. Fixed a two-sessions commit bug. |
| 2026-06-28 | Added `/api/v1` prefix + CORS. camelCase auto-conversion. |
| 2026-06-28 | **Student modules** complete: Profile, Achievements, Experience, Projects (JSON tech_stack + mentor rule), Skills (3 tables, grouped GET, type-routed delete). |
| 2026-06-28 | **Academic**: semesters + subjects tables, MIT WPU SGPA/CGPA calculation. **Dashboard**: counts + cumulative CGPA + trend. **Entire student backend done.** |

---

## 15. Build Order

| # | Module | Status |
|---|--------|--------|
| 1 | Server + DB foundation | done |
| 2 | Auth (login, me, change-password) | done |
| 3 | Profile | done |
| 4 | Achievements | done |
| 5 | Experience | done |
| 6 | Projects | done |
| 7 | Skills (technical / soft / languages) | done |
| 8 | Academic records + CGPA | done |
| 9 | Student dashboard | done |
| 10 | **Admin** (bulk Excel seeding, account mgmt, bulk marks upload) | todo |
| 11 | **Teacher portal** (notes, assessments, project marks, milestones, timeline) | todo |
| 12 | **Analytics** (tiers, guidance cases, support flags, admin dashboard) | todo |
| 13 | Deploy prep (prod Postgres, error format, refresh token, logout, CORS prod origins) | todo |

---

## 16. Open Questions / TODO (for the team)

- **`upcomingDeadlines`** (dashboard) — no data source defined anywhere in the SRS/contract.
  Currently returns `[]`. Where does deadline data come from?
- **`cgpaTrend` naming** — each point is labeled `cgpa` but is actually the **SGPA**. Rename to
  `sgpa` (coordinated change with frontend) or keep as-is? — flag to Dhruv.
- **`avatar` vs `avatarUrl`** — contract's user object says `avatar`, profile object says `avatarUrl`.
  DB column is `avatar`; API exposes `avatarUrl`. Dhruv to standardize.
- **Refresh token + logout** — in the contract, not yet built (we issue only an access token).
- **Excel marks upload** — the real source for academic data (admin-side). Today's academic data is
  seeded manually; the endpoint shape won't change when Excel import is added.
- **Postgres** — switch back from SQLite once Docker is resolved on the dev machine.