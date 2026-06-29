/**
 * Academic types — re-exported from the canonical API entities.
 * Local grade/GPA calculation utilities remain here.
 */

export type { Semester, SubjectMark } from '../../api/entities/semester';

/**
 * Local form state for academic records.
 * Omits server-generated fields (createdAt, updatedAt).
 * Used by AcademicContext for local state management.
 */
export interface SemesterRecord {
  id: string;
  semesterNumber: number;
  gpa: number;
  totalCredits: number;
  subjects: import('../../api/entities/semester').SubjectMark[];
}

export function getGradeAndPoints(marksObtained: number, maxMarks: number): { grade: string; points: number } {
  if (maxMarks <= 0 || marksObtained < 0 || marksObtained > maxMarks) return { grade: 'NA', points: 0 };
  const pct = Math.round((marksObtained / maxMarks) * 100);
  
  if (pct >= 90) return { grade: 'O', points: 10 };
  if (pct >= 80) return { grade: 'A+', points: 9 };
  if (pct >= 70) return { grade: 'A', points: 8 };
  if (pct >= 60) return { grade: 'B+', points: 7 };
  if (pct >= 50) return { grade: 'B', points: 6 };
  if (pct >= 45) return { grade: 'C', points: 5 };
  if (pct >= 40) return { grade: 'P', points: 4 };
  return { grade: 'F', points: 0 };
}

export function calculateGPA(subjects: { marksObtained: number; maxMarks: number; credits: number }[]): number {
  if (subjects.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;

  for (const sub of subjects) {
    const { points } = getGradeAndPoints(sub.marksObtained, sub.maxMarks);
    totalPoints += (points * sub.credits);
    totalCredits += sub.credits;
  }
  
  if (totalCredits === 0) return 0;
  return Number((totalPoints / totalCredits).toFixed(2));
}

export function calculateCGPA(semesters: { gpa: number; totalCredits: number }[]): number {
  if (semesters.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;

  for (const sem of semesters) {
    totalPoints += (sem.gpa * sem.totalCredits);
    totalCredits += sem.totalCredits;
  }
  
  if (totalCredits === 0) return 0;
  return Number((totalPoints / totalCredits).toFixed(2));
}

export function calculatePercentage(gpaOrCgpa: number): number {
  const pct = (gpaOrCgpa - 0.75) * 10;
  return Number(Math.max(0, pct).toFixed(2));
}
