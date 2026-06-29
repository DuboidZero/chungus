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
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
