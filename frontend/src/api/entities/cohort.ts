/**
 * Cohort entity.
 * Represents an academic group of students.
 */

export interface Cohort {
  id: string;
  academicYear: 'FY' | 'SY' | 'TY' | 'Final Year';
  department: string;
  studentCount: number;
  academicMentorId?: string | null;
  academicMentorName?: string | null;
}
