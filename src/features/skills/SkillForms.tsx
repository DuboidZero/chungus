import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../shared/ui/modal';
import { Label } from '../../shared/ui/label';
import { Select } from '../../shared/ui/select';
import type { TechnicalSkill, SoftSkill, LanguageSkill } from './types';

const generateId = () => Math.random().toString(36).substring(2, 9);

/** Modal component for adding new technical skills with domain categorization. */
export function AddTechnicalSkillModal({
  isOpen, onClose, onSave
}: {
  isOpen: boolean; onClose: () => void; onSave: (s: TechnicalSkill) => void;
}) {
  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setDomain('');
      setName('');
      setProficiency(3);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!domain.trim()) { alert('Please enter a domain.'); return; }
    if (!name.trim()) { alert('Please enter a skill name.'); return; }
    onSave({ id: generateId(), domain, name, proficiency });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Technical Skill" maxWidth="sm">
      <div className="space-y-4">
        <div>
          <Label>Domain</Label>
          <input
            type="text"
            placeholder="e.g. Web Development"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-brand-700 bg-white dark:bg-brand-900 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <Label>Skill Name</Label>
          <input
            type="text"
            placeholder="e.g. React"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-brand-700 bg-white dark:bg-brand-900 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <Label>Proficiency (1-5)</Label>
          <Select value={proficiency} onChange={e => setProficiency(Number(e.target.value))}>
            <option value={1}>1 - Beginner</option>
            <option value={2}>2 - Novice</option>
            <option value={3}>3 - Intermediate</option>
            <option value={4}>4 - Advanced</option>
            <option value={5}>5 - Expert</option>
          </Select>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-brand-700 hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
        </div>
      </div>
    </Modal>
  );
}

/** Modal component for adding new soft skills. */
export function AddSoftSkillModal({
  isOpen, onClose, onSave
}: {
  isOpen: boolean; onClose: () => void; onSave: (s: SoftSkill) => void;
}) {
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setProficiency('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!name.trim()) { alert('Please enter a skill name.'); return; }
    onSave({ id: generateId(), name, proficiency: proficiency === '' ? undefined : Number(proficiency) });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Soft Skill" maxWidth="sm">
      <div className="space-y-4">
        <div>
          <Label>Skill Name</Label>
          <input
            type="text"
            placeholder="e.g. Leadership"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-brand-700 bg-white dark:bg-brand-900 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <Label>Proficiency (Optional)</Label>
          <Select value={proficiency} onChange={e => setProficiency(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">Not rated</option>
            <option value={1}>1 - Beginner</option>
            <option value={2}>2 - Novice</option>
            <option value={3}>3 - Intermediate</option>
            <option value={4}>4 - Advanced</option>
            <option value={5}>5 - Expert</option>
          </Select>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-brand-700 hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
        </div>
      </div>
    </Modal>
  );
}

/** Modal component for adding new languages and proficiency levels. */
export function AddLanguageModal({
  isOpen, onClose, onSave
}: {
  isOpen: boolean; onClose: () => void; onSave: (s: LanguageSkill) => void;
}) {
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState<LanguageSkill['proficiency']>('Basic');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setProficiency('Basic');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!name.trim()) { alert('Please enter a language name.'); return; }
    onSave({ id: generateId(), name, proficiency });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Language" maxWidth="sm">
      <div className="space-y-4">
        <div>
          <Label>Language Name</Label>
          <input
            type="text"
            placeholder="e.g. English"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-brand-700 bg-white dark:bg-brand-900 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <Label>Proficiency Level</Label>
          <Select value={proficiency} onChange={e => setProficiency(e.target.value as any)}>
            <option value="Basic">Basic</option>
            <option value="Conversational">Conversational</option>
            <option value="Proficient">Proficient</option>
            <option value="Fluent">Fluent</option>
            <option value="Native">Native</option>
          </Select>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-brand-700 hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
        </div>
      </div>
    </Modal>
  );
}
