/**
 * Feature-based Role-Based Access Control (RBAC) definitions.
 * UI components evaluate these functions rather than checking roles directly
 * to centralize permissions logic and ease future backend migration.
 */

import type { Role } from './roles';

/** Profile & Portfolio Permissions */
export const canEditProfile = (role: Role) => role === 'student';
export const canPublishPortfolio = (role: Role) => role === 'student';

/** Academic Records Permissions */
export const canViewOwnRecords = (role: Role) => role === 'student';
export const canViewAllRecords = (role: Role) => role === 'teacher' || role === 'admin';
export const canEditRecords = (role: Role) => role === 'admin';

/** Assessments & Teacher Notes Permissions */
export const canViewTeacherNotes = (role: Role) => role === 'teacher' || role === 'admin';
export const canCreateAssessments = (role: Role) => role === 'teacher' || role === 'admin';

/** Students Permissions */
export const canViewAllStudents = (role: Role) => role === 'teacher' || role === 'admin';
export const canUploadStudents = (role: Role) => role === 'admin';

/** Analytics Permissions */
export const canViewAnalytics = (role: Role) => role === 'teacher' || role === 'admin';
export const canViewSystemAnalytics = (role: Role) => role === 'admin';

/** Admin-only Permissions */
export const canManageUsers = (role: Role) => role === 'admin';
export const canManageCohorts = (role: Role) => role === 'admin';
export const canManageRoles = (role: Role) => role === 'admin';
