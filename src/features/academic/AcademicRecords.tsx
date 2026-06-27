import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SemesterCard } from './SemesterCard';
import { AddSemesterModal } from './AddSemesterModal';
import { DeleteConfirmModal } from '../../shared/ui/modal';
import type { SemesterRecord } from './types';
import { calculateCGPA } from './types';

import { useAcademic } from './AcademicContext';

export function AcademicRecords() {
  const { semesters, addSemester, updateSemester, deleteSemester } = useAcademic();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterRecord | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cgpa = calculateCGPA(semesters);
  const totalCredits = semesters.reduce((acc, sem) => acc + sem.totalCredits, 0);

  const handleSaveSemester = (record: SemesterRecord) => {
    if (editingSemester) {
      updateSemester(record);
    } else {
      addSemester(record);
    }
    setEditingSemester(undefined);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteSemester(deletingId);
      setDeletingId(null);
    }
  };

  const openEdit = (sem: SemesterRecord) => {
    setEditingSemester(sem);
    setIsAddModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Academic Records</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your semester-wise performance.</p>
        </div>
        
        {/* Aggregate Stats */}
        <div className="flex items-center gap-6 px-6 py-3 bg-white dark:bg-brand-900 rounded-xl border border-slate-200 dark:border-brand-800 shadow-sm">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Overall CGPA</p>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{cgpa.toFixed(2)}</p>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-brand-800" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total Credits</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCredits}</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingSemester(undefined); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Semester
        </button>
      </div>

      {/* Semester List */}
      <div className="space-y-6">
        {semesters.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-brand-900 rounded-xl border border-dashed border-slate-300 dark:border-brand-700">
            <p className="text-slate-500 dark:text-slate-400">No academic records added yet.</p>
          </div>
        ) : (
          semesters.map(sem => (
            <SemesterCard
              key={sem.id}
              semester={sem}
              onEdit={() => openEdit(sem)}
              onDelete={() => setDeletingId(sem.id)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <AddSemesterModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingSemester(undefined); }}
        onSave={handleSaveSemester}
        initialData={editingSemester}
      />

      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Semester"
        entityName={`Semester ${semesters.find(s => s.id === deletingId)?.semesterNumber}`}
      />
    </div>
  );
}
