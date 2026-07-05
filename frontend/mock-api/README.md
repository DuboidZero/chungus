# mock-api/

> **What is this folder?**
> Realistic mock API responses that mirror the FastAPI contract exactly.
> When `VITE_USE_MOCK=true`, the frontend consumes these files through the mock driver instead of calling the real backend.

---

## Structure

```
mock-api/
  students/           ← One file per student. Contains ALL data for that student.
    aarav-sharma.json
    priya-iyer.json
    rohan-desai.json
    nisha-kulkarni.json
    karan-mehta.json
    pooja-nair.json
    arjun-patil.json
    meera-joshi.json
    suresh-rao.json
    ritika-verma.json
  teacher/
    anand-patel.json  ← Teacher data including dashboard, notes, marks, timelines
  admin/
    sunita-krishnan.json
```

## Per-Student File Format

Each student JSON contains **all data** for that person. The mock driver slices it into the shape each API endpoint expects:

```json
{
  "_meta": { "tier": "Outstanding", "completion": 95 },
  "user":          { ... User },
  "profile":       { ... Profile },
  "dashboard":     { ... StudentDashboardResponse },
  "academic":      [ ...Semester[] ],
  "skills":        { "technical": [], "soft": [], "languages": [] },
  "projects":      [ ...Project[] ],
  "experience":    [ ...Experience[] ],
  "achievements":  [ ...Achievement[] ]
}
```

## How it maps to API endpoints

| Endpoint | Mock source |
|----------|-------------|
| `GET /me` | `student.user` |
| `GET /me/profile` | `student.profile` |
| `GET /me/dashboard` | `student.dashboard` |
| `GET /me/academic-records` | `student.academic` |
| `GET /me/skills` | `student.skills` |
| `GET /me/projects` | `student.projects` |
| `GET /me/experience` | `student.experience` |
| `GET /me/achievements` | `student.achievements` |
| `GET /teacher/dashboard` | `teacher.dashboard` |
| `GET /teacher/students` | `teacher.students` |
| `GET /teacher/students/:id/overview` | Built from `student.*` |
| `GET /teacher/students/:id/timeline` | `teacher.timelines[studentId]` |
| `GET /teacher/students/:id/notes` | `teacher.notes[studentId]` |
| `GET /teacher/students/:id/marks` | `teacher.marks[studentId]` |

## IDs Reference

| Name | Role | User ID | PRN |
|------|------|---------|-----|
| Aarav Sharma | student | `c7e2f8a1-4b3d-4e9a-8f5c-2d1e6b7a9c04` | 1032210001 |
| Priya Iyer | student | `d8f3a9b2-5c4e-4f0b-9a6d-3e2f7c8b0d15` | 1032210002 |
| Rohan Desai | student | `e9a4b0c3-6d5f-4a1c-ab7e-4f3a8d9c1e26` | 1032210003 |
| Nisha Kulkarni | student | `f0b5c1d4-7e6a-4b2d-bc8f-5a4b9e0d2f37` | 1032210004 |
| Karan Mehta | student | `a1c6d2e5-8f7b-4c3e-cd9a-6b5c0f1e3a48` | 1032210005 |
| Pooja Nair | student | `b2d7e3f6-9a8c-4d4f-de0b-7c6d1a2f4b59` | 1032210006 |
| Arjun Patil | student | `c3e8f4a7-0b9d-4e5a-ef1c-8d7e2b3a5c60` | 1032210007 |
| Meera Joshi | student | `d4f9a5b8-1c0e-4f6b-f02d-9e8f3c4b6d71` | 1032210008 |
| Suresh Rao | student | `e5a0b6c9-2d1f-4a7c-a13e-0f9a4d5c7e82` | 1032210009 |
| Ritika Verma | student | `f6b1c7d0-3e2a-4b8d-b24f-1a0b5e6d8f93` | 1032210010 |
| Dr. Anand Patel | teacher | `a7c2d8e1-4f3b-4c9e-c35a-2b1c6f7e9a04` | T1032001 |
| Ms. Sunita Krishnan | admin | `b8d3e9f2-5a4c-4d0f-d46b-3c2d7a8f0b15` | A1001001 |

## Rules

1. **Never add a field that doesn't exist in the API contract.** (Except `_meta` which is mock-only.)
2. All `id` fields are UUID v4.
3. All `createdAt` / `updatedAt` are ISO 8601 strings.
4. Cross-references must be internally consistent (e.g., `studentId` in notes must match that student's `user.id`).
5. Do **not** add this folder to `.gitignore`. It is shared development data.
