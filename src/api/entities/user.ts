/**
 * Core user identity entity.
 * Represents the authenticated user across all roles in the system.
 */

export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  prn: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  batch?: string;
  academicYear?: string;
  avatar?: string;
  cohortId?: string;
  academicMentorId?: string | null;
  academicMentorName?: string | null;
  deactivated?: boolean;
  firstLogin?: boolean;
  createdAt: string;
  updatedAt: string;
}
