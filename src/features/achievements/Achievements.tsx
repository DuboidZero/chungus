import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DeleteConfirmModal } from '../../shared/ui/modal';
import { AchievementCard } from './AchievementCard';
import { AchievementFormModal } from './AchievementFormModal';
import type { AchievementEntry } from './types';
import { getAchievements, createAchievement, updateAchievement, deleteAchievement } from '../../api/services/achievements';
import { Skeleton } from '../../shared/ui/loading-skeleton';

/** Fetches the certified achievements and awards from the backend service. */

export function Achievements() {
  const [entries, setEntries] = useState<AchievementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAchievements()
      .then(res => setEntries(res as unknown as AchievementEntry[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (entry: AchievementEntry) => {
    try {
      if (editingId) {
        const saved = await updateAchievement(entry.id, entry as any);
        setEntries(entries.map(e => e.id === entry.id ? (saved as unknown as AchievementEntry) : e));
      } else {
        const created = await createAchievement(entry as any);
        const newEntries = [...entries, created as unknown as AchievementEntry]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(newEntries);
      }
    } catch (err) {
      console.error('Failed to save achievement', err);
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await deleteAchievement(deletingId);
        setEntries(entries.filter(e => e.id !== deletingId));
        setDeletingId(null);
      } catch (err) {
        console.error('Failed to delete achievement', err);
      }
    }
  };

  const editingEntry = entries.find(e => e.id === editingId);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Achievements Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Log your competitions, hackathons, awards, and publications.</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-container hover:bg-primary text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Achievement
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {entries.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onEdit={() => { setEditingId(achievement.id); setIsModalOpen(true); }}
            onDelete={() => setDeletingId(achievement.id)}
          />
        ))}
      </div>
      
      {entries.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-surface-container-lowest rounded-xl border border-dashed border-slate-300 dark:border-outline-variant">
          <p className="text-slate-500 dark:text-slate-400">No achievements logged yet. Add your wins!</p>
        </div>
      )}

      {/* Modals */}
      <AchievementFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null); }}
        onSave={handleSave}
        initialData={editingEntry}
      />
      
      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Achievement"
        entityName={entries.find(e => e.id === deletingId)?.title || ''}
      />
    </div>
  );
}