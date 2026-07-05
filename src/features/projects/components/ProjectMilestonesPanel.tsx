import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Select } from '../../../shared/ui/select';
import type { ProjectMilestone, MilestoneStatus } from '../../../api/entities/teacher';

interface Props {
  milestones: ProjectMilestone[];
  onAddMilestone: (ms: { description: string; status: MilestoneStatus; date: string }) => void;
}

export function ProjectMilestonesPanel({ milestones, onAddMilestone }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<{description: string, status: MilestoneStatus, date: string}>({ description: '', status: 'On Track', date: new Date().toISOString().split('T')[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMilestone(form);
    setIsFormOpen(false);
    setForm({ description: '', status: 'On Track', date: new Date().toISOString().split('T')[0] });
  };

  const getStatusColor = (status: MilestoneStatus) => {
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-700 border-emerald-500';
    if (status === 'Delayed') return 'bg-red-100 text-red-700 border-red-500';
    return 'bg-blue-100 text-blue-700 border-blue-500';
  };

  const getStatusEmoji = (status: MilestoneStatus) => {
    if (status === 'Completed') return '🟢';
    if (status === 'Delayed') return '🟡';
    return '🟢';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <Flag className="w-5 h-5 text-purple-500" /> Milestones
        </h3>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="text-sm font-medium text-purple-600 hover:text-purple-700">
          {isFormOpen ? 'Cancel' : '+ Add Milestone'}
        </button>
      </div>

      {isFormOpen && (
        <Card className="border-purple-200">
          <CardContent className="p-4 sm:p-5 bg-purple-50/30">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Description</label>
                <input required type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2 text-sm bg-white border border-outline-variant rounded-md focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Status</label>
                  <Select value={form.status} onChange={e => setForm({...form, status: e.target.value as MilestoneStatus})}>
                    <option value="On Track">On Track</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Completed">Completed</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Date</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full p-2 text-sm bg-white border border-outline-variant rounded-md focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700">Save Milestone</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {milestones.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-outline-variant rounded-lg">
          <p className="text-sm text-on-surface-variant font-medium">No milestones logged.</p>
        </div>
      ) : (
        <div className="relative pl-3 mt-4 border-l-2 border-outline-variant ml-3 space-y-6">
          {milestones.map(ms => (
            <div key={ms.id} className="relative">
              <div className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 bg-white ${getStatusColor(ms.status)}`} />
              <div>
                <p className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <span>{getStatusEmoji(ms.status)} {ms.status}</span>
                  <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">{new Date(ms.date).toLocaleDateString()}</span>
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {ms.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
