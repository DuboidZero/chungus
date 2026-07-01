/**
 * Academic Context.
 * Provides semester records state management.
 *
 * Mock data (INITIAL_SEMESTERS) has been removed.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SemesterRecord } from './types';
import { calculateGPA } from './types';
import { getAcademicRecords } from '../../api/services/academic';

interface AcademicContextType {
  semesters: SemesterRecord[];
  addSemester: (sem: SemesterRecord) => void;
  updateSemester: (sem: SemesterRecord) => void;
  deleteSemester: (id: string) => void;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [semesters, setSemesters] = useState<SemesterRecord[]>([]);

  useEffect(() => {
    getAcademicRecords()
      .then(res => setSemesters(res as unknown as SemesterRecord[]))
      .catch(console.error);
  }, []);

  const addSemester = (sem: SemesterRecord) => {
    /** Creates a new semester record via the backend service and updates the local state. */
    const withGpa = { ...sem, gpa: calculateGPA(sem.subjects) };
    setSemesters(prev => [...prev, withGpa].sort((a, b) => a.semesterNumber - b.semesterNumber));
  };

  const updateSemester = (sem: SemesterRecord) => {
    /** Updates an existing semester record via the backend service and refreshes the local state. */
    const withGpa = { ...sem, gpa: calculateGPA(sem.subjects) };
    setSemesters(prev => prev.map(s => (s.id === sem.id ? withGpa : s)).sort((a, b) => a.semesterNumber - b.semesterNumber));
  };

  const deleteSemester = (id: string) => {
    /** Deletes the specified semester record via the backend service and updates the local state. */
    setSemesters(prev => prev.filter(s => s.id !== id));
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
