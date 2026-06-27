import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SemesterRecord } from './types';
import { calculateGPA } from './types';

interface AcademicContextType {
  semesters: SemesterRecord[];
  addSemester: (sem: SemesterRecord) => void;
  updateSemester: (sem: SemesterRecord) => void;
  deleteSemester: (id: string) => void;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const INITIAL_SEMESTERS: SemesterRecord[] = [
  {
    id: 'sem1',
    semesterNumber: 1,
    gpa: 8.5,
    totalCredits: 22,
    subjects: [
      { id: 's1', name: 'Engineering Mathematics I', marksObtained: 85, maxMarks: 100, grade: 'A+', credits: 4 },
      { id: 's2', name: 'Basic Electrical Engineering', marksObtained: 78, maxMarks: 100, grade: 'A', credits: 4 },
      { id: 's3', name: 'Programming in C', marksObtained: 92, maxMarks: 100, grade: 'O', credits: 4 }
    ]
  },
  {
    id: 'sem2',
    semesterNumber: 2,
    gpa: 8.9,
    totalCredits: 24,
    subjects: [
      { id: 's4', name: 'Engineering Mathematics II', marksObtained: 88, maxMarks: 100, grade: 'A+', credits: 4 },
      { id: 's5', name: 'Data Structures', marksObtained: 95, maxMarks: 100, grade: 'O', credits: 4 }
    ]
  }
];

export function AcademicProvider({ children }: { children: ReactNode }) {
  /** Re-evaluate initial mock GPAs using the authoritative calculation logic to ensure consistency. */
  const initializedSemesters = INITIAL_SEMESTERS.map(sem => ({
    ...sem,
    gpa: calculateGPA(sem.subjects)
  }));

  const [semesters, setSemesters] = useState<SemesterRecord[]>(initializedSemesters);

  const addSemester = (sem: SemesterRecord) => {
    setSemesters([...semesters, sem].sort((a, b) => a.semesterNumber - b.semesterNumber));
  };

  const updateSemester = (sem: SemesterRecord) => {
    setSemesters(semesters.map(s => (s.id === sem.id ? sem : s)).sort((a, b) => a.semesterNumber - b.semesterNumber));
  };

  const deleteSemester = (id: string) => {
    setSemesters(semesters.filter(s => s.id !== id));
  };

  return (
    <AcademicContext.Provider value={{ semesters, addSemester, updateSemester, deleteSemester }}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (context === undefined) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}
