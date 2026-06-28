# Polytechnic Portfolio System — Backend Development Notes

Internal reference for backend engineers working on the Polytechnic Portfolio System (MIT WPU, SRS v1.2).
This document tracks the project structure, setup steps, the exact commands we run, and the database schema as it grows. Keep it updated as new modules are added.

> All backend code lives in the `backend/` folder of the `Student-Portfolio-Project` repo.

---

## 1. Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Language | Python 3.14 | — |
| Web framework | FastAPI | REST API + auto-generated docs |
| ASGI server | Uvicorn | Runs the FastAPI app |
| ORM | SQLAlchemy | Define tables as Python classes |
| DB driver | psycopg2-binary | Connects Python ↔ PostgreSQL |
| Database | PostgreSQL 16 (via Docker) | Relational store |
| Migrations | Alembic | Versioned schema changes |
| Config | python-dotenv | Loads secrets from `.env` |

---

## 2. Prerequisites

Make sure these are installed before starting:

- Python 3.11+ (we use 3.14)
- Git
- Docker Desktop (must be **running** — whale icon in the tray)

Verify:

```powershell
python --version
git --version
docker --version
```

---

## 3. Project Structure

```
backend/
├── .venv/                  # Python virtual environment (gitignored)
├── .env                    # Secrets — DATABASE_URL (gitignored, NEVER commit)
├── .env.example            # Template of required env vars (committed)
├── .gitignore
├── main.py                 # FastAPI app entrypoint (/health)
├── requirements.txt        # Pinned dependencies
├── docker-compose.yml      # PostgreSQL 16 container definition
├── alembic.ini             # Alembic config
├── alembic/
│   ├── env.py              # Wired to load DATABASE_URL + discover models
│   └── versions/           # Migration recipe files (one per schema change)
│       └── ac07e45b500a_create_users_table.py
└── app/
    ├── __init__.py
    ├── database.py         # engine, SessionLocal, Base (shared DB setup)
    └── models/
        ├── __init__.py
        └── user.py         # User model (auth/login identity)
```

### Folder roles
- **`app/database.py`** — shared database plumbing. Defines `engine` (connection to Postgres), `SessionLocal` (per-request DB sessions), and `Base` (parent class all models inherit from).
- **`app/models/`** — the database side: one file per table, each a class inheriting from `Base`.
- **`alembic/`** — migration recipes. Each schema change is a versioned file here.

---

## 4. First-Time Setup (new engineer)

```powershell
# 1. Clone the repo and enter the backend folder
cd Student-Portfolio-Project/backend

# 2. Create and activate the virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1        # Windows PowerShell
# (look for the (.venv) prefix on your prompt)

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your .env from the template, then fill in values
copy .env.example .env

# 5. Start the PostgreSQL database
docker compose up -d

# 6. Apply all migrations (creates the tables)
alembic upgrade head

# 7. Run the server
uvicorn main:app --reload
```

Server runs at `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`
- Interactive API docs: `http://127.0.0.1:8000/docs`

> **PowerShell script error?** If activation is blocked, run once:
> `Set-ExecutionPolicy -Scope CurrentUser -RemoteSigned`

---

## 5. Daily Workflow

Every new terminal session:

```powershell
cd Student-Portfolio-Project/backend
.\.venv\Scripts\Activate.ps1        # re-activate venv (per-session)
docker compose up -d                # ensure Postgres is running
uvicorn main:app --reload           # start the server
```

- **Virtual env** must be re-activated each session.
- **Docker** containers persist across sessions; this just ensures it's up.

---

## 6. Environment Variables (`.env`)

```
DATABASE_URL=postgresql+psycopg2://portfolio:portfolio@localhost:5432/portfolio
```

Breakdown of the connection string:
- `postgresql+psycopg2` → use Postgres via the psycopg2 driver
- `portfolio:portfolio` → username : password
- `@localhost:5432` → host : port
- `/portfolio` → database name

> `.env` is **gitignored** because it holds the DB password. `.env.example` documents the keys without real secrets and is committed.

---

## 7. Database

### Local dev database (Docker — `docker-compose.yml`)
| Setting | Value |
|---------|-------|
| Image | postgres:16 |
| Container name | portfolio_db |
| User | portfolio |
| Password | portfolio |
| Database | portfolio |
| Port | 5432 |
| Volume | pgdata (data persists across restarts) |

### Current Schema

#### `users` — authentication identity
Login identity differs by role: students log in with **PRN**, staff (teacher/admin) with **email**. Exactly one is filled per row, so both are nullable.

| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary key |
| role | String | admin / teacher / student |
| prn | String | Unique, nullable (students only) |
| email | String | Unique, nullable (staff only) |
| hashed_password | String | Never store plain passwords |
| must_change_password | Boolean | Forces change on first login (SRS 3.1.2) |
| is_active | Boolean | For deactivation instead of deletion |

> Conditional rule "PRN required if student, else email" is enforced in **application code**, not the table (the DB only marks both nullable).

---

## 8. Migrations (Alembic)

Migrations are versioned recipe files that create/alter tables. They keep every environment (your machine, teammates, production) in sync — same recipes → same schema.

### One-time Alembic setup (already done)
```powershell
alembic init alembic
```
Then `alembic/env.py` was edited to:
1. Load `DATABASE_URL` from `.env`
2. Import every model so Alembic can detect them
3. Set `target_metadata = Base.metadata`

### Creating a migration (after adding/changing a model)
```powershell
alembic revision --autogenerate -m "describe the change"
```
This writes a new file in `alembic/versions/`. **Always open and read it before applying.**

### Applying migrations
```powershell
alembic upgrade head      # apply all pending migrations
alembic downgrade -1      # roll back the last migration
```

### ⚠️ Rule for every new model
When you add a new model file, **import it in `alembic/env.py`** (e.g. `from app.models.project import Project`). If you forget, autogenerate won't detect the table.

---

## 9. Dependencies (`requirements.txt`)

Directly installed (the full pinned tree lives in `requirements.txt`, which is the source of truth):

```
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
python-dotenv
alembic
```

After installing anything new, re-pin:
```powershell
pip freeze > requirements.txt
```

---

## 10. Git Workflow

- Backend work lives in the `backend/` folder; it never touches the frontend's `src/`.
- Work on a **feature branch**, never commit straight to the shared branch.
- One logical change per commit, with a clear message (`feat:`, `fix:`, `chore:`).

```powershell
git checkout -b feat/<task-name>     # branch per brick
git add .
git commit -m "feat: <what you did>"
git push -u origin feat/<task-name>  # -u only needed on first push
```

Open a Pull Request to merge into the main branch for review.

---

## 11. Useful Verification Commands

```powershell
docker ps                                                            # is Postgres running?
docker compose up -d                                                 # start Postgres
docker compose down                                                  # stop Postgres (data persists)

# Peek inside the database:
docker exec -it portfolio_db psql -U portfolio -d portfolio -c "\dt"        # list tables
docker exec -it portfolio_db psql -U portfolio -d portfolio -c "\d users"   # describe users table
# (press q to exit the psql viewer)

git status            # what's about to be committed
git ls-files          # what Git is actually tracking
```

---

## 12. Progress Log

| Date | Work done |
|------|-----------|
| 2026-06-28 | Project foundation: FastAPI server + `/health`; PostgreSQL 16 in Docker; SQLAlchemy connection via `.env`; `User` model; Alembic set up + first migration (`users` table). |

### Next up
- Seed a test student into the `users` table.
- Build the **authentication** module: login (PRN/email), `/me`, forced first-login password change.

---

## 13. Build Order (planned)

Student vertical first, then admin/teacher:
1. ✅ Server + database foundation
2. ⬜ Auth (login, change password, me)
3. ⬜ Student profile
4. ⬜ Skills (technical, soft, languages)
5. ⬜ Projects
6. ⬜ Work experience
7. ⬜ Achievements
8. ⬜ (later) Marks/academics — deferred pending data source decision
9. ⬜ (later) Admin & Teacher modules, analytics
