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
          <h1 className="text-3xl font-bold text-on-surface">Academic Records</h1>
          <p className="text-on-surface-variant mt-1">
            Your semester-wise performance as recorded by your institution.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-6 px-6 py-3 bg-white rounded-xl border border-outline-variant shadow-sm">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Overall CGPA</p>
            <p className="text-2xl font-bold text-primary">{cgpa.toFixed(2)}</p>
          </div>
          <div className="w-px h-10 bg-surface-container-high" />
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Total Credits</p>
            <p className="text-2xl font-bold text-on-surface">{totalCredits}</p>
          </div>
        </div>
      </div>

      {/* Semester List */}
      <div className="space-y-6">
        {semesters.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-outline-variant">
            <GraduationCap className="w-10 h-10 mx-auto text-on-surface-variant/60 mb-3" />
            <p className="text-on-surface-variant font-medium">No academic records available yet.</p>
            <p className="text-sm text-on-surface-variant/70 mt-1">Records are added by your institution's administration.</p>
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
