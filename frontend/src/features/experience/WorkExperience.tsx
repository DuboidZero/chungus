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
      .then(res => {
        const sorted = (res as unknown as WorkExperienceEntry[])
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setEntries(sorted);
      })
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
          <h1 className="text-3xl font-bold text-on-surface">Work Experience</h1>
          <p className="text-on-surface-variant mt-1">Chronicle your professional journey and internships.</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-container hover:bg-primary text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {entries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-outline-variant">
            <p className="text-on-surface-variant">No work experience added yet.</p>
          </div>
        ) : (
          <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-outline-variant">
            {entries.map((entry) => (
              <div key={entry.id} className="relative group">
                {/* Icon Marker */}
                <div className="absolute -left-8 top-5 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-primary-container text-white shadow shrink-0">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>

                {/* Content Card */}
                <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-outline-variant transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-on-surface">{entry.role}</h3>
                      <p className="font-medium text-primary text-sm">{entry.organisationName}</p>
                    </div>
                    {/* Hover Actions */}
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                      <button onClick={() => { setEditingId(entry.id); setIsModalOpen(true); }} className="p-1.5 text-on-surface-variant/70 hover:text-primary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingId(entry.id)} className="p-1.5 text-on-surface-variant/70 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      {entry.type}
                    </span>
                    <span className="text-sm font-medium text-on-surface-variant">
                      {new Date(entry.startDate).toLocaleDateString('default', { month: 'short', year: 'numeric' })} — {entry.endDate ? new Date(entry.endDate).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : 'Present'}
                    </span>
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
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
