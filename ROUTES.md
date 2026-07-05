# Frontend Routing Documentation

The MIT Portfolio System uses a **Role-Based Routing** architecture implemented with `react-router-dom`. Routes are conditionally rendered at the root (`App.tsx`) based on the authenticated user's role (`student`, `teacher`, or `admin`).

If a user attempts to access a route they do not have permissions for, or a route that does not exist within their role's router, they are redirected to their default dashboard (`/`). Unauthenticated users are redirected to `/login`.

---

## 🔒 Public / Unauthenticated

These routes are accessible to users without a valid session.

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | `LoginPage` | User authentication portal. Redirects to `/` if already logged in. |

---

## 🎓 Student Portal

The default router for users with the `student` role. All routes are protected and render within the `AppLayout` wrapper.

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `StudentDashboard` | Main dashboard with CGPA charts, summary stats, and quick links. |
| `/profile` | `Profile` | Student personal, contact, and internship preference details. |
| `/academic-records` | `AcademicRecords` | Semester-wise GPA, subject marks, and grades. |
| `/skills` | `Skills` | Technical domains, soft skills, and languages management. |
| `/projects` | `Projects` | Portfolio project listing with cards. |
| `/projects/new` | `ProjectForm` | Form to create a new project. |
| `/projects/:id/edit` | `ProjectForm` | Form to edit an existing project. |
| `/work-experience` | `WorkExperience` | Timeline of internships and professional experience. |
| `/achievements` | `Achievements` | Timeline of certifications, awards, and publications. |
| `/settings` | `Stub` | *(Coming Soon)* User account settings. |

---

## 👨‍🏫 Teacher Portal

The router for faculty and teaching staff. All routes are protected and render within the `AppLayout` wrapper.

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `TeacherDashboard` | Cohort health, students needing attention, and recent activity. |
| `/students` | `Stub` | *(Coming Soon)* Student directory and individual profiles. |
| `/assessments` | `Stub` | *(Coming Soon)* Teacher evaluations and skill endorsements. |
| `/analytics` | `Stub` | *(Coming Soon)* Class performance metrics and insights. |
| `/settings` | `Stub` | *(Coming Soon)* Faculty account settings. |

---

## 🛡️ Admin Portal

The router for system administrators. All routes are protected and render within the `AppLayout` wrapper.

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `AdminDashboard` | System-wide statistics and global cohort overviews. |
| `/users` | `Stub` | *(Coming Soon)* Global user management. |
| `/cohorts` | `Stub` | *(Coming Soon)* Batch/cohort creation and management. |
| `/analytics` | `Stub` | *(Coming Soon)* Platform-wide analytics and reporting. |
| `/permissions` | `Stub` | *(Coming Soon)* RBAC and permissions management. |
| `/settings` | `Stub` | *(Coming Soon)* System settings. |

---

## Routing Implementation Details

- **Entry Point**: `frontend/src/App.tsx` handles the overarching `<Router>`, `<ThemeProvider>`, and `<AuthProvider>`.
- **Role Router**: The `RoleRouter` component dynamically swaps the entire route tree based on the user's role to guarantee complete isolation of views.
- **Protection**: The `<ProtectedRoute>` wrapper ensures that child components cannot be rendered unless the user is authenticated (and optionally, holds a specific role).
- **Navigation Sidebars**: The sidebars corresponding to these routes are configured via constant arrays in `frontend/src/shared/layout/navigation/`.
