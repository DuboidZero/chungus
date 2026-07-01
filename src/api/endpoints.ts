/**
 * API endpoint constants.
 * Single source of truth for all route paths.
 * Backend implements these exactly.
 */

export const API = {
  // ─── Health ──────────────────────────────────────────
  HEALTH: '/health',

  // ─── Auth ────────────────────────────────────────────
  AUTH: {
    LOGIN:   '/auth/login',
    LOGOUT:  '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // ─── Student-owned resources (under /me) ─────────────
  ME: '/me',
  
  TEACHERS: '/teachers',

  DASHBOARD: '/me/dashboard',

  PROFILE: '/me/profile',

  ACADEMIC_RECORDS: '/me/academic-records',
  ACADEMIC_RECORD:  (id: string) => `/me/academic-records/${id}` as const,

  SKILLS: '/me/skills',
  SKILLS_TECHNICAL: '/me/skills/technical',
  SKILLS_SOFT:      '/me/skills/soft',
  SKILLS_LANGUAGES: '/me/skills/languages',
  SKILL:            (type: string, id: string) => `/me/skills/${type}/${id}` as const,

  PROJECTS: '/me/projects',
  PROJECT:  (id: string) => `/me/projects/${id}` as const,

  EXPERIENCE:      '/me/experience',
  EXPERIENCE_ITEM: (id: string) => `/me/experience/${id}` as const,

  ACHIEVEMENTS:     '/me/achievements',
  ACHIEVEMENT_ITEM: (id: string) => `/me/achievements/${id}` as const,

  // ─── Teacher-owned resources (under /teacher) ──────────
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    STUDENTS: '/teacher/students',
    STUDENT_OVERVIEW: (id: string) => `/teacher/students/${id}/overview` as const,
    STUDENT_TIMELINE: (id: string) => `/teacher/students/${id}/timeline` as const,
    STUDENT_NOTES: (id: string) => `/teacher/students/${id}/notes` as const,
    STUDENT_MARKS: (id: string) => `/teacher/students/${id}/marks` as const,
    STUDENT_PROJECTS: (id: string) => `/teacher/students/${id}/projects` as const,
    PROJECTS: '/teacher/projects',
    PROJECT_DETAIL: (id: string) => `/teacher/projects/${id}` as const,
    PROJECT_MARKS: (id: string) => `/teacher/projects/${id}/marks` as const,
    PROJECT_MILESTONES: (id: string) => `/teacher/projects/${id}/milestones` as const,
    GUIDANCE_CASE: (id: string) => `/teacher/guidance-cases/${id}` as const,
  },

  // ─── Admin endpoints ────────────────────────
  ADMIN: {
    COHORTS: '/admin/cohorts',
    COHORT: (id: string) => `/admin/cohorts/${id}` as const,
  }
} as const;
