import { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { Modal } from '../../shared/ui/modal';
import { Label } from '../../shared/ui/label';
import { Select } from '../../shared/ui/select';
import { Textarea } from '../../shared/ui/textarea';
import type { AchievementEntry, AchievementCategory, AchievementType, AchievementLevel } from './types';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: AchievementEntry) => void;
  initialData?: AchievementEntry;
}

export function AchievementFormModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [data, setData] = useState<AchievementEntry>({
    id: generateId(),
    title: '',
    description: '',
    category: 'Technical',
    type: 'Competition',
    level: 'College',
    date: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setData(initialData);
      } else {
        setData({
          id: generateId(),
          title: '',
          description: '',
          category: 'Technical',
          type: 'Competition',
          level: 'College',
          date: ''
        });
      }
    }
  }, [isOpen, initialData]);

  const setField = <K extends keyof AchievementEntry>(key: K, value: AchievementEntry[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!data.title.trim() || !data.date) {
      alert('Please fill out Title and Date.');
      return;
    }
    onSave(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Achievement' : 'Add Achievement'} maxWidth="lg">
      <div className="space-y-5">
        
        <div>
          <Label>Achievement Title</Label>
          <input
            type="text"
            placeholder="e.g. 1st Place, Smart India Hackathon"
            value={data.title}
            onChange={e => setField('title', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-brand-700 bg-white dark:bg-brand-950 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={data.category} onChange={e => setField('category', e.target.value as AchievementCategory)}>
              <option value="Academic">Academic</option>
              <option value="Technical">Technical</option>
              <option value="Co-curricular">Co-curricular</option>
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={data.type} onChange={e => setField('type', e.target.value as AchievementType)}>
              <option value="Competition">Competition</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Award">Award</option>
              <option value="Certification">Certification</option>
              <option value="Publication">Publication</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div>
            <Label>Level</Label>
            <Select value={data.level} onChange={e => setField('level', e.target.value as AchievementLevel)}>
              <option value="College">College</option>
              <option value="State">State</option>
              <option value="National">National</option>
              <option value="International">International</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>Date</Label>
          <input
            type="date"
            value={data.date}
            onChange={e => setField('date', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-brand-700 bg-white dark:bg-brand-950 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <Label>Description (max 300 chars)</Label>
          <Textarea
            rows={3}
            placeholder="Briefly describe the achievement, the competition, or your contribution..."
            value={data.description}
            onChange={e => setField('description', e.target.value.slice(0, 300))}
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">
            {data.description.length} / 300
          </p>
        </div>

        {/* Certificate Upload Placeholder */}
        <div>
          <Label>Certificate / Proof</Label>
          <div className="mt-1 w-full py-4 rounded-xl border border-dashed border-slate-300 dark:border-brand-700 bg-slate-50 dark:bg-brand-900/50 flex flex-col items-center justify-center hover:bg-slate-100 dark:hover:bg-brand-900 transition-colors cursor-pointer group">
            <Upload className="w-5 h-5 text-slate-400 mb-2 group-hover:text-brand-500 transition-colors" />
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Upload PDF or Image</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Optional (Phase 2 feature)</span>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-brand-800">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-brand-700 hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-lg flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
        </div>
      </div>
    </Modal>
  );
}
