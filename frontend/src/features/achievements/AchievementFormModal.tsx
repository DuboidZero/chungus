import { useState, useEffect, useRef } from 'react';
import { Save, Upload, FileText, X } from 'lucide-react';
import { Modal } from '../../shared/ui/modal';
import { Label } from '../../shared/ui/label';
import { Select } from '../../shared/ui/select';
import { Textarea } from '../../shared/ui/textarea';
import type { AchievementEntry, AchievementCategory, AchievementType, AchievementLevel } from './types';
import { uploadFile } from '../../api/services/upload';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCertificateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5MB.');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setField('certificateUrl', url);
    } catch (err) {
      console.error('Certificate upload failed', err);
      alert('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (uploading) {
      alert('Please wait for the file to finish uploading.');
      return;
    }
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
            className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
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
            className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <Label>Description (max 300 chars)</Label>
          <Textarea
            rows={3}
            placeholder="Briefly describe the achievement, the competition, or your contribution..."
            value={data.description ?? ''}
            onChange={e => setField('description', e.target.value.slice(0, 300))}
          />
          <p className="text-xs text-on-surface-variant/70 mt-1 text-right">
            {(data.description ?? '').length} / 300
          </p>
        </div>

        {/* Certificate Upload */}
        <div>
          <Label>Certificate / Proof</Label>
          {data.certificateUrl ? (
            <div className="mt-1 w-full py-3 px-4 rounded-xl border border-outline-variant bg-surface-container-low flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <a href={data.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate flex-1">
                View uploaded file
              </a>
              <button
                type="button"
                onClick={() => setField('certificateUrl', undefined)}
                className="text-on-surface-variant/70 hover:text-red-500 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="mt-1 w-full py-4 rounded-xl border border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center hover:bg-surface-container transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-5 h-5 text-on-surface-variant/70 mb-2 group-hover:text-primary transition-colors" />
              <span className="text-sm text-on-surface-variant font-medium">
                {uploading ? 'Uploading...' : 'Upload PDF or Image'}
              </span>
              <span className="text-[10px] text-on-surface-variant/70 mt-0.5">PDF, JPG, PNG (max 5MB)</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={handleCertificateChange}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/40">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-outline-variant hover:bg-surface-container transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={uploading} className="px-5 py-2 bg-primary-container hover:bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4"/> Save</button>
        </div>
      </div>
    </Modal>
  );
}