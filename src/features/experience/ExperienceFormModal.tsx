import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../shared/ui/modal';
import { Label } from '../../shared/ui/label';
import { Select } from '../../shared/ui/select';
import { Textarea } from '../../shared/ui/textarea';
import type { WorkExperienceEntry, ExperienceType } from './types';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: WorkExperienceEntry) => void;
  initialData?: WorkExperienceEntry;
}

export function ExperienceFormModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [data, setData] = useState<WorkExperienceEntry>({
    id: generateId(),
    organisationName: '',
    role: '',
    type: 'Internship',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [isPresent, setIsPresent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setData(initialData);
        setIsPresent(!initialData.endDate);
      } else {
        setData({
          id: generateId(),
          organisationName: '',
          role: '',
          type: 'Internship',
          startDate: '',
          endDate: '',
          description: ''
        });
        setIsPresent(false);
      }
    }
  }, [isOpen, initialData]);

  const setField = <K extends keyof WorkExperienceEntry>(key: K, value: WorkExperienceEntry[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!data.organisationName.trim() || !data.role.trim() || !data.startDate) {
      alert('Please fill out Organisation, Role, and Start Date.');
      return;
    }
    if (!isPresent && data.endDate && data.endDate < data.startDate) {
      alert('End date cannot be before start date.');
      return;
    }
    onSave({ ...data, endDate: isPresent ? undefined : data.endDate });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Experience' : 'Add Experience'} maxWidth="lg">
      <div className="space-y-5">
        
        <div>
          <Label>Organisation Name</Label>
          <input
            type="text"
            placeholder="e.g. Google, Tech Startup"
            value={data.organisationName}
            onChange={e => setField('organisationName', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>Role / Designation</Label>
            <input
              type="text"
              placeholder="e.g. Software Engineering Intern"
              value={data.role}
              onChange={e => setField('role', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <Label>Employment Type</Label>
            <Select value={data.type} onChange={e => setField('type', e.target.value as ExperienceType)}>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
              <option value="Full-time">Full-time</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>Start Date</Label>
            <input
              type="month"
              value={data.startDate}
              onChange={e => setField('startDate', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-on-surface-variant">End Date</label>
              <label className="flex items-center gap-1.5 text-xs text-on-surface-variant cursor-pointer">
                <input type="checkbox" checked={isPresent} onChange={e => setIsPresent(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                Currently working here
              </label>
            </div>
            <input
              type="month"
              value={data.endDate || ''}
              onChange={e => setField('endDate', e.target.value)}
              disabled={isPresent}
              min={data.startDate || undefined}
              className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary disabled:opacity-50 disabled:bg-surface-container"
            />
          </div>
        </div>

        <div>
          <Label>Description (max 500 chars)</Label>
          <Textarea
            rows={4}
            placeholder="Describe your responsibilities and achievements..."
            value={data.description}
            onChange={e => setField('description', e.target.value.slice(0, 500))}
          />
          <p className="text-xs text-on-surface-variant/70 mt-1 text-right">
            {data.description.length} / 500
          </p>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/40">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-outline-variant hover:bg-surface-container transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-primary-container hover:bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
        </div>
      </div>
    </Modal>
  );
}
