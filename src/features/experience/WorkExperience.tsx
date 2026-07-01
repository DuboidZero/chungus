import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';
import { DeleteConfirmModal } from '../../shared/ui/modal';
import { ExperienceFormModal } from './ExperienceFormModal';
import type { WorkExperienceEntry } from './types';
import { getExperience, createExperience, updateExperience, deleteExperience } from '../../api/services/experience';
import { Skeleton } from '../../shared/ui/loading-skeleton';

export function WorkExperience() {
  const [entries, setEntries] = useState<WorkExperienceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getExperience()
      .then(res => setEntries(res as unknown as WorkExperienceEntry[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (entry: WorkExperienceEntry) => {
    try {
      if (editingId) {
        const saved = await updateExperience(entry.id, entry as any);
        setEntries(entries.map(e => e.id === entry.id ? (saved as unknown as WorkExperienceEntry) : e));
      } else {
        const created = await createExperience(entry as any);
        const newEntries = [...entries, created as unknown as WorkExperienceEntry]
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setEntries(newEntries);
      }
    } catch (err) {
      console.error('Failed to save experience', err);
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await deleteExperience(deletingId);
        setEntries(entries.filter(e => e.id !== deletingId));
        setDeletingId(null);
      } catch (err) {
        console.error('Failed to delete experience', err);
      }
    }
  };

  const editingEntry = entries.find(e => e.id === editingId);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-12">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Work Experience</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Chronicle your professional journey and internships.</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {entries.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-brand-900 rounded-xl border border-dashed border-slate-300 dark:border-brand-700">
            <p className="text-slate-500 dark:text-slate-400">No work experience added yet.</p>
          </div>
        ) : (
          <div className="space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-500 before:to-slate-200 dark:before:to-brand-900">
            {entries.map((entry) => (
              <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                
                {/* Icon Marker */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0f172a] bg-brand-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Briefcase className="w-4 h-4" />
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-brand-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-brand-800 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{entry.role}</h3>
                      <p className="font-medium text-brand-600 dark:text-brand-400">{entry.organisationName}</p>
                    </div>
                    {/* Hover Actions */}
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(entry.id); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingId(entry.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-brand-800 text-slate-600 dark:text-slate-300">
                      {entry.type}
                    </span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {new Date(entry.startDate).toLocaleDateString('default', { month: 'short', year: 'numeric' })} — {entry.endDate ? new Date(entry.endDate).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : 'Present'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {entry.description}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ExperienceFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null); }}
        onSave={handleSave}
        initialData={editingEntry}
      />
      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Experience"
        entityName={entries.find(e => e.id === deletingId)?.role || ''}
      />
    </div>
  );
}
