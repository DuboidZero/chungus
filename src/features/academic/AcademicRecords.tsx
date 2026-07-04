import { GraduationCap } from 'lucide-react';
import { SemesterCard } from './SemesterCard';
import { calculateCGPA } from './types';
import { useAcademic } from './AcademicContext';

export function AcademicRecords() {
  const { semesters } = useAcademic();

  const cgpa = calculateCGPA(semesters);
  const totalCredits = semesters.reduce((acc, sem) => acc + sem.totalCredits, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Academic Records</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your semester-wise performance as recorded by your institution.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-6 px-6 py-3 bg-white dark:bg-surface-container-lowest rounded-xl border border-slate-200 dark:border-outline-variant shadow-sm">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Overall CGPA</p>
            <p className="text-2xl font-bold text-primary dark:text-primary">{cgpa.toFixed(2)}</p>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-surface-container-high" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total Credits</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCredits}</p>
          </div>
        </div>
      </div>

      {/* Semester List */}
      <div className="space-y-6">
        {semesters.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-surface-container-lowest rounded-xl border border-dashed border-slate-300 dark:border-outline-variant">
            <GraduationCap className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No academic records available yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Records are added by your institution's administration.</p>
          </div>
        ) : (
          semesters.map(sem => (
            <SemesterCard key={sem.id} semester={sem} />
          ))
        )}
      </div>
    </div>
  );
}
