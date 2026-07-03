# DEPLOYMENT.md — Backend Deployment Guide

How to deploy this FastAPI backend so it runs the same way it does in dev.
Read this fully once before your first deploy.

> **Key difference from dev:** local dev uses **SQLite** (`portfolio.db`, a file).
> Production should use **Postgres** (a database server). The application code is
> identical — only the `DATABASE_URL` changes and you run migrations against the
> prod database. Everything else (routes, models, auth) works unchanged.

---

## 0. Pre-deploy checklist

- [ ] All code committed and pushed to the repo
- [ ] `requirements.txt` is up to date (see REQUIREMENTS section below)
- [ ] `.env` values ready for production (NOT committed — set them in the host's env settings)
- [ ] A production database provisioned (Postgres recommended)
- [ ] Supabase bucket exists and is **public**

---

## 1. Environment variables (set these on the host, never commit)

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>
SECRET_KEY=<long random string, different from dev>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SECRET_KEY=<supabase secret key>
SUPABASE_BUCKET=portfolio-files
```

Notes:
- For **Postgres**, `DATABASE_URL` starts with `postgresql://`. For SQLite it was `sqlite:///./portfolio.db`.
- If your host requires it, the driver form is `postgresql+psycopg://...` (depends on the installed driver — see step 2).
- Generate a strong `SECRET_KEY`: `python -c "import secrets; print(secrets.token_urlsafe(48))"`
- Set these in the platform's dashboard (Render/Railway/etc.) or the server's environment — do **not** put the prod `.env` in git.

---

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

If deploying with Postgres, make sure a Postgres driver is installed. Add ONE of these
to requirements.txt if not already present:
```
psycopg[binary]        # modern; use DATABASE_URL=postgresql+psycopg://...
# or
psycopg2-binary        # classic; use DATABASE_URL=postgresql://...
```
(SQLite needs no driver — it's built into Python. Postgres does.)

---

## 3. Create the database schema (migrations)

The database starts **empty**. Alembic builds all tables from the migration history —
do NOT manually create tables. Run:

```bash
alembic upgrade head
```

This applies every migration in `alembic/versions/` in order, producing the exact
same schema as dev. Run this against the production `DATABASE_URL`.

> If you ever change models later: `alembic revision --autogenerate -m "msg"`,
> review the generated file, commit it, and run `alembic upgrade head` on each
> environment. Never edit the database schema by hand.

---

## 4. Seed the initial admin

A fresh database has no users. Create the first admin so you can log in:

```bash
python seed.py
```

Default admin: `admin@mitwpu.edu.in` / `admin123`.
**Change this password immediately after first login in production.**
(Edit `seed.py` to set a stronger initial admin password before deploying if you prefer.)

---

## 5. Run the server (production)

Do NOT use `--reload` in production. Use a production ASGI server:

```bash
# Option A: uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000

# Option B: gunicorn + uvicorn workers (better for production; add gunicorn to requirements)
gunicorn main:app -k uvicorn.workers.UvicornWorker --workers 4 --bind 0.0.0.0:8000
```

`--host 0.0.0.0` makes it reachable from outside the container/VM. The port may be
dictated by the platform (many inject a `$PORT` env var — use `--port $PORT`).

---

## 6. CORS — allow the deployed frontend

In `main.py`, `allow_origins` currently lists `http://localhost:5173`.
**Add your deployed frontend URL** (e.g. `https://your-frontend.vercel.app`) or the
requests will be blocked in the browser. Update this before/at deploy time.

---

## 7. Full deploy command sequence (copy-paste order)

```bash
# on the production host / build step
pip install -r requirements.txt
alembic upgrade head          # build schema
python seed.py                # create admin (first deploy only)
# then start the server (see step 5)
uvicorn main:app --host 0.0.0.0 --port 8000
```

For a **redeploy** (code update, DB already exists): pull code → `pip install -r requirements.txt`
→ `alembic upgrade head` (applies any new migrations) → restart the server. **Do not**
re-run `seed.py` (it's idempotent — it skips if the admin exists — but no need).

---

## 8. Platform-specific notes

**Render / Railway (managed PaaS):**
- Build command: `pip install -r requirements.txt`
- Pre-deploy / release command: `alembic upgrade head`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set all env vars in the dashboard. Provision their managed Postgres and copy its `DATABASE_URL`.
- Run `python seed.py` once via their shell/console after first deploy.

**Docker (VPS or any container host):**
- Base image `python:3.14-slim`, `COPY` the app, `pip install -r requirements.txt`.
- Entrypoint: run `alembic upgrade head` then start uvicorn.
- Pass env vars via `--env-file` or the orchestrator's secrets.

**Bare VPS (systemd):**
- Same command sequence; run uvicorn/gunicorn behind Nginx as a reverse proxy.

---

## 9. Common deploy problems

| Problem | Fix |
|---------|-----|
| App starts but every DB call fails | `DATABASE_URL` wrong, or Postgres driver not installed (step 2) |
| Tables don't exist | You skipped `alembic upgrade head` |
| Can't log in / no users | You skipped `python seed.py` |
| Browser blocked (CORS) | Add the frontend URL to `allow_origins` in `main.py` (step 6) |
| File uploads fail | Supabase env vars wrong, or bucket not public |
| "Could not import module main" | Start command must run from the folder containing `main.py` |
| Works locally, breaks in prod | Almost always: env vars not set, or SQLite-only assumption. Check `DATABASE_URL`. |