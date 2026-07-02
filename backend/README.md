# MIT WPU Polytechnic Portfolio — Backend

A FastAPI backend for a student portfolio & mentorship platform. Students maintain
portfolios (projects, skills, achievements, work experience, academic records);
teachers mentor assigned students; admins manage users, academic records, cohorts,
and bulk data imports.

> **This document is the single source of truth for the backend.** Read it top to
> bottom to understand the whole system. It is kept current as the backend evolves.

---

## 1. Tech Stack

| Layer            | Choice                                             |
|------------------|----------------------------------------------------|
| Language         | Python 3.14                                        |
| Web framework    | FastAPI                                            |
| ORM              | SQLAlchemy 2.0                                      |
| Migrations       | Alembic                                            |
| Database         | SQLite (dev) — `portfolio.db`; Postgres (prod target) |
| Auth             | JWT (python-jose, HS256) + bcrypt password hashing |
| File storage     | Supabase Storage (cloud) via `supabase-py`         |
| Excel parsing    | openpyxl (bulk imports)                             |

All API routes are served under the prefix **`/api/v1`**.

---

## 2. Project Structure

```
backend/
├── main.py                  # App entry: CORS, router registration, loads .env
├── requirements.txt
├── alembic.ini              # Alembic config
├── alembic/
│   ├── env.py               # Imports every model so autogenerate sees them
│   └── versions/            # Migration files
├── seed.py                  # Creates the initial admin account (run after a DB reset)
├── .env                     # SECRETS — never committed (see section 9)
└── app/
    ├── database.py          # Engine, SessionLocal, Base, TimestampMixin
    ├── core/
    │   ├── security.py      # Password hashing, JWT, password generators
    │   ├── dependencies.py  # get_current_user / _teacher / _admin, assert_mentors_student
    │   ├── grading.py       # SGPA / CGPA / percentage calculators
    │   └── teacher_helpers.py
    ├── models/              # SQLAlchemy models (one file per domain)
    ├── schemas/             # Pydantic request/response models (CamelModel base)
    └── routes/              # API routes (one file per domain)
        └── teacher/         # Teacher routes split across dashboard/views/records/guidance
```

---

## 3. Core Concepts

### 3.1 Roles
Three roles, stored on `users.role`: **`student`**, **`teacher`**, **`admin`**.

### 3.2 Auth flow
- Login returns a JWT access token (30-min expiry) + refresh token (7-day).
- The token carries the user id as `sub`.
- Every protected request sends `Authorization: Bearer <token>`.
- `get_current_user` decodes the token, loads the user, and rejects deactivated accounts.

### 3.3 First login / password change
- Bulk-created students get an initial password: **first 4 letters of name (lowercase) + year of birth** (e.g. "Rahul Sharma" born 2004 → `rahu2004`). SRS 3.1.2.
- New accounts have `must_change_password = True` → frontend forces a password change on first login.
- Admin password reset generates a **cryptographically random** temp password (`secrets`), returned once, and re-sets `must_change_password`.

### 3.4 Mentorship & Cohorts (important — read this)
There are two related pieces:

- **`MentorAssignment`** — the direct link `teacher → student` (one mentor per student, enforced by a unique constraint on `student_id`). **This is the single source of truth for "who mentors whom."** The entire teacher portal reads mentorship from here.

- **`Cohort`** — a group of students sharing the same `(academic_year, department)`, e.g. "FY + Computer Engineering". A cohort has an optional `mentor_id`.

**How they work together (the bridge design):**
- Cohorts are **auto-created during bulk student import** — when a student is imported with an academic year + department, the matching cohort is found or created.
- When an admin **assigns a mentor to a cohort** (`PATCH /admin/cohorts/:id`), the backend sets `cohort.mentor_id` **AND writes a `MentorAssignment` row for every student in that cohort.**
- Because mentorship is materialized into `MentorAssignment`, the teacher portal works **unchanged** — it still reads `MentorAssignment`. Cohorts are a management layer on top; `MentorAssignment` stays the source of truth.
- A student's cohort membership is **derived** by matching their `academic_year` + `department` to a cohort (no `cohort_id` FK on the student).

> Note: editing a student's year/department via `PATCH /admin/users/:id` updates the
> user but does **not** auto-create a cohort or re-sync mentors (auto-creation happens
> on import only). Known behavior, not a bug.

---

## 4. Data Models

All models inherit `TimestampMixin` (`created_at`, `updated_at`). IDs are UUID strings.

| Model             | Table                | Key fields                                                                 |
|-------------------|----------------------|----------------------------------------------------------------------------|
| `User`            | `users`              | role, name, department, academic_year, batch, prn (unique), email (unique), hashed_password, must_change_password, is_active |
| `Profile`         | `profiles`           | user_id, avatar, about_me, email, phone, location, internship_preference, preferred_radius, domain_interest |
| `Project`         | `projects`           | user_id, name, description, domain, tech_stack, type, mentor_name, status, start_date, end_date, image_url |
| `TechnicalSkill`  | (skills)             | user_id, domain, name, proficiency (1–5)                                   |
| `SoftSkill`       | (skills)             | user_id, name, proficiency                                                 |
| `Language`        | (skills)             | user_id, name, proficiency (Basic…Native)                                  |
| `Achievement`     | `achievements`       | user_id, title, description, category, type, level, date, certificate_url  |
| `Experience`      | `experiences`        | user_id, organisation_name, role, type, start_date, end_date, description  |
| `Semester`        | `semesters`          | user_id, semester_number                                                   |
| `Subject`         | `subjects`           | semester_id, name, marks_obtained, max_marks, grade, credits               |
| `MentorAssignment`| `mentor_assignments` | teacher_id, student_id (unique)                                            |
| `Cohort`          | `cohorts`            | academic_year, department, mentor_id — unique (academic_year, department)  |
| `PrivateNote`     | `teacher_records`    | teacher_id, student_id, content                                            |
| `AssessmentMark`  | `teacher_records`    | teacher_id, student_id, project_id, assessment_title, score, max_score, comments, date |
| `ProjectMilestone`| `teacher_records`    | project_id, description, status, date                                      |
| `GuidanceCase`    | `teacher_records`    | student_id, owning_teacher_id, trigger_signal, status, resolution_note, date_opened, date_resolved |

GPA/CGPA are **computed server-side** from Subject marks (see `core/grading.py`) — never sent by the client.

---

## 5. Authorization Rules (RBAC)

Auth primitives live in `app/core/dependencies.py`:
- `get_current_user` — valid token + active account.
- `get_current_teacher` / `get_current_admin` — role-gated (403 otherwise).
- `assert_mentors_student(db, teacher_id, student_id)` — 403 unless a `MentorAssignment` links them.

**Enforcement patterns:**
- **Student routes** scope every query to `current_user.id`. Update/delete use a double filter (`id == X AND user_id == current_user.id`) → accessing another user's resource returns **404** (doesn't leak existence).
- **Teacher routes** call `assert_mentors_student` on every endpoint that takes a `student_id` or `project_id`. Project endpoints fetch the project first, then check mentorship on `project.user_id`.
- **Admin routes** are all gated by `get_current_admin`. Toggle-status guards against self-deactivation and deactivating the last active admin.

---

## 6. API Endpoints

Base prefix: **`/api/v1`**. All non-auth endpoints require a Bearer token.

### 6.1 Auth (`auth.py`)
| Method | Path              | Notes                                  |
|--------|-------------------|----------------------------------------|
| POST   | `/auth/login`     | Body uses `identifier` (PRN or email) + password. Returns tokens + `first_login`. |
| POST   | `/auth/token`     | OAuth2 token endpoint                   |
| POST   | `/auth/refresh`   | Exchange refresh token for a new access token |
| GET    | `/me`             | Current user (includes profile `avatar`) |
| GET    | `/auth/me`        | Backwards-compat alias of `/me`        |

### 6.2 Student — own portfolio (scoped to logged-in user)
| Domain       | Endpoints                                                             |
|--------------|----------------------------------------------------------------------|
| Profile      | `GET /me/profile`, `PATCH /me/profile`                               |
| Projects     | `GET/POST /me/projects`, `PATCH/DELETE /me/projects/{id}`            |
| Skills       | `GET /me/skills`; `POST /me/skills/{technical|soft|languages}`; `DELETE /me/skills/{type}/{id}` |
| Achievements | `GET/POST /me/achievements`, `PATCH/DELETE /me/achievements/{id}`    |
| Experience   | `GET/POST /me/experience`, `PATCH/DELETE /me/experience/{id}`        |
| Academic     | `GET/POST /me/academic-records`, `PATCH/DELETE /me/academic-records/{id}` |
| Dashboard    | `GET /me/dashboard`                                                  |
| Upload       | `POST /me/upload` (multipart file → Supabase → returns `{url}`)      |

### 6.3 Teacher (`routes/teacher/`)
| Method | Path                                              | Notes                         |
|--------|---------------------------------------------------|-------------------------------|
| GET    | `/teacher/students`                               | Mentored students (+ cgpa, tier, avatar) |
| GET    | `/teacher/students/{id}`                          | Basic info (name, prn, avatar) |
| GET    | `/teacher/students/{id}/overview`                 | Stats, CGPA trend             |
| GET    | `/teacher/students/{id}/academic-records`         |                               |
| GET    | `/teacher/students/{id}/projects`                 |                               |
| GET    | `/teacher/students/{id}/timeline`                 | Notes, marks, milestones, achievements, skills, cases |
| GET    | `/teacher/projects/{id}`                          | Project detail                |
| Notes  | `POST/GET /teacher/students/{id}/notes`, `PATCH/DELETE .../notes/{noteId}` | Author-only edit/delete |
| Marks  | `POST/GET /teacher/students/{id}/marks`, `GET /teacher/marks`, `POST/GET /teacher/projects/{id}/marks` | |
| Milest.| `POST/GET /teacher/projects/{id}/milestones`      |                               |
| Guidance | `POST /teacher/guidance-cases`, `PATCH /teacher/guidance-cases/{id}` | |
| Dash   | `GET /teacher/dashboard`                          | Cohort stats, support-needed, analytics (cgpaDistribution, gpaTrend, skillHeatmap, domainInterests, achievementVolume, projectActivity, internshipPreferences) |

### 6.4 Admin (`admin.py`) — all require admin role
| Method | Path                                              | Notes                          |
|--------|---------------------------------------------------|--------------------------------|
| GET    | `/admin/users`                                    | Summary list (optional `?role=`) |
| GET    | `/admin/users-list`                               | Full details for admin UI (`?role=`) |
| PATCH  | `/admin/users/{id}`                               | Update name/email/department/academic_year/batch (email uniqueness checked) |
| POST   | `/admin/users/{id}/reset-password`                | Random temp password, returned once |
| POST   | `/admin/users/{id}/toggle-status`                 | Flip active/deactivated (guards self + last admin). Returns `{deactivated}` |
| POST   | `/admin/teachers`                                 | Create a single teacher        |
| Academic | `POST /admin/students/{id}/academic-records`, `PATCH/DELETE .../{semesterId}` | GPA computed server-side; duplicate-semester guard |
| Cohorts | `GET /admin/cohorts`                             | `{id, academicYear, department, studentCount, academicMentorId, academicMentorName}` |
| Cohorts | `PATCH /admin/cohorts/{id}`                      | Body `{academicMentorId}`. Sets cohort mentor + writes MentorAssignment for all members |
| Imports | `POST /admin/import/students`                    | See section 7                  |
| Imports | `POST /admin/import/academic-records`            |                                |
| Imports | `POST /admin/import/skills`                      |                                |
| Imports | `POST /admin/import/projects`                    |                                |
| Imports | `POST /admin/import/achievements`                |                                |
| Imports | `POST /admin/import/work-experience`             |                                |

---

## 7. Bulk Imports

Each import takes `multipart/form-data` with a single `file` (Excel). **First column is always PRN** (links each row to a student); remaining columns mirror the manual-entry fields. Every import validates per-row and returns:

```json
{ "created": <int>, "skipped": <int>, "errors": ["Row N: reason", ...] }
```

Bad rows are reported with row numbers; good rows still import (per-row resilience — each row is flushed independently, so one bad row doesn't sink the batch).

**Excel column formats (in order):**

| Import            | Columns                                                                                  |
|-------------------|------------------------------------------------------------------------------------------|
| Students          | PRN, Full Name, Year of Birth, Batch, Branch, **Academic Year** (FY/SY/TY) — Academic Year auto-creates the cohort |
| Academic records  | PRN, Semester, Subject, Obtained, Max, Credits                                           |
| Skills            | PRN, Skill Type (Technical/Soft/Language), Name, Domain, Proficiency (1–5 or Basic…Native) |
| Projects          | PRN, Name, Description, Domain, Tech Stack (comma-sep), Type, Mentor Name, Status, Start Date, End Date |
| Achievements      | PRN, Title, Description, Category, Type, Level, Date                                      |
| Work Experience   | PRN, Organisation Name, Role, Type, Start Date, End Date, Description                     |

Dates accept `YYYY-MM-DD` or `YYYY-MM`. Student import skips duplicate PRNs (both in-DB and in-file).

---

## 8. Setup & Running

```bash
# 1. From the backend/ folder, create + activate a venv, then:
pip install -r requirements.txt

# 2. Create .env (see section 9)

# 3. Apply migrations (creates all tables)
alembic upgrade head

# 4. Create the initial admin
python seed.py            # admin@mitwpu.edu.in / admin123

# 5. Run the server (MUST be from the backend/ folder)
uvicorn main:app --reload
```

Interactive API docs: `http://127.0.0.1:8000/docs`

**Reset the database from scratch:** delete `portfolio.db` → `alembic upgrade head` → `python seed.py`.

---

## 9. Environment (`.env`) — never commit this

```
DATABASE_URL=sqlite:///./portfolio.db
SECRET_KEY=<random secret for JWT signing>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SECRET_KEY=<supabase service/secret key>
SUPABASE_BUCKET=portfolio-files
```

`.env` is gitignored. The Supabase bucket must be set **public** for file URLs to resolve. Share these values with teammates privately (never via git).

---

## 10. Migrations (Alembic)

- Every model must be imported in `alembic/env.py` so autogenerate detects it.
- Create a migration: `alembic revision --autogenerate -m "message"`
- **Always review the generated file** before applying (SQLite can produce odd ops).
- Apply: `alembic upgrade head`. Roll back one: `alembic downgrade -1`.

---

## 11. Conventions & Notes

- Schemas use a `CamelModel` base → snake_case (Python) ⇄ camelCase (JSON) automatically.
- Response models never expose password hashes.
- Accessing another user's resource returns 404 (not 403) to avoid leaking existence.
- Input validation lives primarily in Pydantic schemas (`schemas/validators.py` holds shared helpers); DB/business rules (date order, PRN existence, uniqueness) are enforced in routes.
- The old `POST /admin/assignments` (direct per-student mentor assignment) is superseded by cohort-based assignment; prefer cohorts.

---

## 12. Test Accounts (dev only)

| Role    | Login                              | Password    |
|---------|------------------------------------|-------------|
| Admin   | `admin@mitwpu.edu.in`              | `admin123`  |
| Teacher | `prof.sharma@mitwpu.edu.in`        | `Test@1234` |
| Student | PRN `1032210010`                   | `Test@1234` |

_(Reset any password by re-hashing via a short script or the admin reset endpoint.)_

---

## 13. Known Gaps / TODO

- **Input validation hardening** is partial (project schema done; skills/achievements/experience/profile pending). Gibberish/free-text detection is out of scope; structural validation (required, length, range, enum) is the target.
- **"Add User"** (single manual user creation) is not implemented — students onboard via bulk import; button hidden in the admin UI.
- Editing a student's year/department does not auto-create a cohort or re-sync mentors (import-only behavior).
- Consider an audit log for sensitive admin actions (deactivations, password resets, mentor changes).

---

## 14. Request / Response Reference (exact shapes)

All JSON is **camelCase** on the wire (Python models are snake_case; conversion is automatic).
`Create` bodies list required vs optional. Enum fields must match one of the listed values exactly.

### 14.1 Auth
```jsonc
// POST /auth/login  — request
{ "identifier": "1032210010 or email", "password": "..." }
// response
{
  "user": { "id","prn","name","email","role","department","avatar","createdAt","updatedAt" },
  "accessToken": "...", "refreshToken": "...", "firstLogin": false
}

// POST /auth/refresh — request
{ "refreshToken": "..." }
// response
{ "accessToken": "...", "refreshToken": "..." }

// Change password (if exposed) — request
{ "currentPassword": "...", "newPassword": "..." }
```

### 14.2 Profile
```jsonc
// PATCH /me/profile — request (all optional)
{
  "avatarUrl": "https://...",      // note: alias -> stored as avatar
  "aboutMe": "string",
  "email": "string", "phone": "string", "location": "string",
  "internshipPreference": "online | offline | none",
  "preferredRadius": "string",
  "domainInterest": "string"
}
```

### 14.3 Projects
```jsonc
// POST /me/projects — request
{
  "name": "string",                 // required
  "description": "string|null",
  "domain": "string|null",
  "techStack": ["React","Node"],    // array of strings
  "imageUrl": "string|null",
  "type": "College Project | Personal Project | Internship Project",   // required
  "mentorName": "string|null",      // required IF type == College Project
  "status": "Ongoing | Completed",  // required
  "startDate": "YYYY-MM-DD | YYYY-MM | null",
  "endDate": "YYYY-MM-DD | YYYY-MM | null"
}
// PATCH /me/projects/{id} — same fields, all optional
```

### 14.4 Skills
```jsonc
// POST /me/skills/technical — { "domain": "string", "name": "string", "proficiency": 1..5 }
// POST /me/skills/soft      — { "name": "string", "proficiency": 1..5 | null }
// POST /me/skills/languages — { "name": "string", "proficiency": "Basic|Conversational|Proficient|Fluent|Native" }
// GET  /me/skills           — { "technical": [...], "soft": [...], "languages": [...] }
// DELETE /me/skills/{technical|soft|languages}/{id}
```

### 14.5 Achievements
```jsonc
// POST /me/achievements — request
{
  "title": "string",                                             // required
  "description": "string|null",
  "category": "Academic | Co-curricular | Sports | Technical | Cultural | Other",   // required
  "type": "Competition | Hackathon | Award | Certification | Publication | Other",  // required
  "level": "College | State | National | International",         // required
  "date": "YYYY-MM-DD | YYYY-MM | null",
  "certificateUrl": "string|null"
}
// PATCH /me/achievements/{id} — same, all optional
```

### 14.6 Work Experience
```jsonc
// POST /me/experience — request
{
  "organisationName": "string",     // required
  "role": "string",                 // required
  "type": "Internship | Part-time | Full-time",   // required
  "startDate": "YYYY-MM-DD | null",
  "endDate": "YYYY-MM-DD | null",
  "description": "string|null"
}
// PATCH /me/experience/{id} — same, all optional
```

### 14.7 Academic Records
```jsonc
// POST /me/academic-records  AND  POST /admin/students/{id}/academic-records — request
{
  "semesterNumber": 3,              // required
  "subjects": [                     // required list
    { "name": "Data Structures", "marksObtained": 92, "maxMarks": 100, "credits": 4, "grade": null }
  ]
}
// response (gpa + totalCredits computed server-side)
{
  "id": "...", "semesterNumber": 3, "gpa": 9.2, "totalCredits": 4,
  "subjects": [ { "id","name","marksObtained","maxMarks","grade","credits" } ],
  "createdAt","updatedAt"
}
// PATCH .../{semesterId} — same shape, all optional; subjects (if sent) REPLACE the whole set
```

### 14.8 Teacher — Notes / Marks / Milestones / Guidance
```jsonc
// POST /teacher/students/{id}/notes         — { "content": "string" }
// POST /teacher/students/{id}/marks         — { "assessmentTitle","score","maxScore","comments","date" }
// POST /teacher/projects/{id}/marks         — same as above (linked to a project)
// POST /teacher/projects/{id}/milestones    — { "description","status":"On Track|Delayed|Completed","date" }
// POST /teacher/guidance-cases              — { "studentId","triggerSignal" }
// PATCH /teacher/guidance-cases/{id}        — { "status":"Open|Resolved|...", "resolutionNote" }
```

### 14.9 Admin — Users
```jsonc
// PATCH /admin/users/{id} — request (all optional)
{ "name","email","department","academicYear","batch" }
// response
{ "id","prn","name","email","role","department","isActive","mustChangePassword" }

// POST /admin/users/{id}/reset-password — response
{ "id","temporaryPassword":"xR3k...","firstLogin":true }

// POST /admin/users/{id}/toggle-status — response
{ "id","deactivated":true }

// POST /admin/teachers — request
{ "email":"...", "fullName":"...", "password":"..." }
```

### 14.10 Admin — Cohorts
```jsonc
// GET /admin/cohorts — response (array)
[ { "id","academicYear","department","studentCount","academicMentorId","academicMentorName" } ]

// PATCH /admin/cohorts/{id} — request
{ "academicMentorId": "teacher-uuid | null" }   // null clears the mentor
// response: the updated cohort object (same shape as above)
```

### 14.11 Admin — Imports (all)
```jsonc
// POST /admin/import/*  — multipart/form-data with field "file"
// response (every import)
{ "created": 3, "skipped": 1, "errors": ["Row 5: reason", ...] }
```

---

## 15. Debugging Guide (symptom → where to look)

| Symptom | Likely cause / where to look |
|---------|------------------------------|
| **422 on create/update** | Request body doesn't match the `Create`/`Update` schema (section 14). Check field names (camelCase), required fields, and enum values. Files: `app/schemas/<domain>.py`. |
| **401 Unauthorized** | Missing/expired token. `get_current_user` in `core/dependencies.py`. Access tokens expire in 30 min. |
| **403 Forbidden** | Wrong role, OR teacher accessing a non-mentored student. `get_current_*` + `assert_mentors_student`. |
| **404 on someone else's resource** | Intentional — student routes double-filter by `user_id`. Not a bug. |
| **Wrong CGPA / GPA** | `core/grading.py` (calculate_sgpa / calculate_cgpa / cgpa_to_percentage). GPA is computed from Subject marks, never from the client. |
| **Teacher can't see a student** | Check `mentor_assignments` table. Cohort mentor assignment writes these rows; verify `PATCH /admin/cohorts/{id}` ran. |
| **Cohort shows 0 students / missing** | Students need matching `academic_year` + `department`. Cohorts auto-create on **import only**, not on edit. |
| **Import row skipped/errored** | Response `errors[]` gives row number + reason. Students skip duplicate PRNs (in-DB or in-file). Enum/format mismatches are per-row errors. |
| **Deactivated user shows Active after refresh** | Frontend must map `isActive` → `deactivated`. Backend returns `isActive`. |
| **Avatar not showing** | `/me` and teacher/student endpoints read avatar from the `Profile` table, not `User`. Check the profile row + Supabase bucket is public. |
| **500 on file upload** | Supabase env vars / bucket. `core/storage.py`. Bucket must be public. |
| **"Could not import module main"** | You ran uvicorn from the wrong folder — must be from `backend/`. |