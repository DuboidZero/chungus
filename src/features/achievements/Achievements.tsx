import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DeleteConfirmModal } from '../../shared/ui/modal';
import { AchievementCard } from './AchievementCard';
import { AchievementFormModal } from './AchievementFormModal';
import type { AchievementEntry } from './types';

const INITIAL_DATA: AchievementEntry[] = [
  {
    id: 'a1',
    title: '1st Place, Smart India Hackathon',
    description: 'Developed a predictive analytics model for agriculture yield. Led the frontend development using React.',
    category: 'Technical',
    type: 'Hackathon',
    level: 'National',
    date: '2023-11-20'
  },
  {
    id: 'a2',
    title: 'Dean\'s Merit List',
    description: 'Awarded for securing a CGPA in the top 2% of the batch during the second year of engineering.',
    category: 'Academic',
    type: 'Award',
    level: 'College',
    date: '2023-08-10'
  },
  {
    id: 'a3',
    title: 'Published Paper in IEEE Conference',
    description: 'Paper titled "IoT Based Smart Healthcare System" published and presented at the International Conference on IoT.',
    category: 'Technical',
    type: 'Publication',
    level: 'International',
    date: '2024-02-15'
  }
];

export function Achievements() {
  const [entries, setEntries] = useState<AchievementEntry[]>(INITIAL_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = (entry: AchievementEntry) => {
    if (editingId) {
      setEntries(entries.map(e => e.id === entry.id ? entry : e));
    } else {
      /** Enforce reverse chronological ordering when inserting new achievements. */
      const newEntries = [...entries, entry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(newEntries);
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      setEntries(entries.filter(e => e.id !== deletingId));
      setDeletingId(null);
    }
  };

  const editingEntry = entries.find(e => e.id === editingId);

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
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-colors shadow-sm"
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
        <div className="text-center py-16 bg-white dark:bg-brand-900 rounded-xl border border-dashed border-slate-300 dark:border-brand-700">
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
