/**
 * Academic entities.
 * Represents semester records and individual subject marks.
 */

export interface SubjectMark {
  id: string;
  name: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  credits: number;
}

export interface Semester {
  id: string;
  semesterNumber: number;
  gpa: number;
  totalCredits: number;
  subjects: SubjectMark[];
  createdAt: string;
  updatedAt: string;
}
