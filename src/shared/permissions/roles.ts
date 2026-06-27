/**
 * Core role definitions and user types.
 * Defines the foundational taxonomy for user identity within the system.
 */

export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatar?: string;
}

/** 
 * Mock user data for development and testing.
 * @todo Migrate to real authentication service mapping upon backend integration.
 */
export const MOCK_USERS: Record<Role, User> = {
  student: {
    id: 'stu-001',
    name: 'Dhruv Inamdar',
    email: 'dhruv.inamdar@mitwpu.edu.in',
    role: 'student',
    department: 'Computer Engineering',
  },
  teacher: {
    id: 'tch-001',
    name: 'Dr. Priya Menon',
    email: 'priya.menon@mitwpu.edu.in',
    role: 'teacher',
    department: 'Computer Engineering',
  },
  admin: {
    id: 'adm-001',
    name: 'Admin User',
    email: 'admin@mitwpu.edu.in',
    role: 'admin',
    department: 'Administration',
  },
};
