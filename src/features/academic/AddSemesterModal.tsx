import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Modal } from '../../shared/ui/modal';
import { Label } from '../../shared/ui/label';
import { Select } from '../../shared/ui/select';
import type { SemesterRecord, SubjectMark } from './types';
import { calculateGPA, getGradeAndPoints } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (semester: SemesterRecord) => void;
  initialData?: SemesterRecord;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function AddSemesterModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [semesterNumber, setSemesterNumber] = useState<number>(1);
  const [subjects, setSubjects] = useState<SubjectMark[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSemesterNumber(initialData.semesterNumber);
        setSubjects([...initialData.subjects]);
      } else {
        setSemesterNumber(1);
        setSubjects([{ id: generateId(), name: '', marksObtained: 0, maxMarks: 100, grade: 'A', credits: 3 }]);
      }
    }
  }, [isOpen, initialData]);

  const handleAddSubject = () => {
    setSubjects([...subjects, { id: generateId(), name: '', marksObtained: 0, maxMarks: 100, grade: 'A', credits: 3 }]);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleSubjectChange = (id: string, field: keyof SubjectMark, value: any) => {
    setSubjects(subjects.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      if (field === 'marksObtained' || field === 'maxMarks') {
        updated.grade = getGradeAndPoints(updated.marksObtained, updated.maxMarks).grade;
      }
      return updated;
    }));
  };

  const handleSave = () => {
    /** Validate that the user has inputted both a semester number and at least one subject. */
    if (subjects.some(s => !s.name.trim())) {
      alert('Please fill in all subject names.');
      return;
    }
    if (subjects.some(s => s.maxMarks <= 0)) {
      alert('Maximum marks must be greater than 0.');
      return;
    }
    if (subjects.some(s => s.marksObtained < 0 || s.marksObtained > s.maxMarks)) {
      alert('Marks obtained cannot be less than 0 or greater than max marks.');
      return;
    }
    
    const newRecord: SemesterRecord = {
      id: initialData?.id || generateId(),
      semesterNumber,
      subjects,
      gpa: calculateGPA(subjects),
      totalCredits: subjects.reduce((acc, s) => acc + Number(s.credits), 0),
    };
    onSave(newRecord);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? `Edit Semester ${initialData.semesterNumber}` : 'Add Semester'} maxWidth="2xl">
      <div className="space-y-6">
        
        {/* Semester Selector */}
        <div className="w-48">
          <Label>Semester</Label>
          <Select value={semesterNumber} onChange={e => setSemesterNumber(Number(e.target.value))}>
            {[1,2,3,4,5,6,7,8].map(num => (
              <option key={num} value={num}>Semester {num}</option>
            ))}
          </Select>
        </div>

        {/* Subjects List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Subjects</Label>
            <button
              onClick={handleAddSubject}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subject
            </button>
          </div>
          
          <div className="space-y-3">
            {subjects.map((sub) => (
              <div key={sub.id} className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-low">
                <div className="flex-1 space-y-3">
                  {/* Row 1: Name & Credits */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Subject Name (e.g. Data Structures)"
                        value={sub.name}
                        onChange={e => handleSubjectChange(sub.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        placeholder="Credits"
                        value={sub.credits}
                        onChange={e => handleSubjectChange(sub.id, 'credits', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-md border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                        min="1" max="6"
                      />
                    </div>
                  </div>
                  {/* Row 2: Marks & Grade */}
                  <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2 w-48">
                      <input
                        type="number"
                        placeholder="Obtained"
                        value={sub.marksObtained}
                        onChange={e => handleSubjectChange(sub.id, 'marksObtained', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-md border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                        min="0"
                        max={sub.maxMarks}
                      />
                      <span className="text-on-surface-variant/70">/</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={sub.maxMarks}
                        onChange={e => handleSubjectChange(sub.id, 'maxMarks', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-md border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                        min="1"
                      />
                    </div>
                    <div className="w-24">
                      <div className="flex items-center justify-center w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container text-sm font-bold text-on-surface-variant select-none">
                        {sub.grade}
                      </div>
                    </div>
                  </div>
                </div>
                {subjects.length > 1 && (
                  <button
                    onClick={() => handleRemoveSubject(sub.id)}
                    className="mt-1 p-1.5 rounded-md text-on-surface-variant/70 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary-container hover:bg-primary text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Semester
          </button>
        </div>
      </div>
    </Modal>
  );
}
