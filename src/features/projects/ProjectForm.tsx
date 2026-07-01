import { useProjects } from './ProjectsContext';
import { uploadFile } from '../../api/services/upload';
import { useState, useEffect, useRef } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Label } from '../../shared/ui/label';
import { Select } from '../../shared/ui/select';
import { Textarea } from '../../shared/ui/textarea';
import type { ProjectEntry, ProjectType, ProjectStatus } from './types';
import { useProjects } from './ProjectsContext';
import { getTeachers } from '../../api/services/users';

type Errors = Partial<Record<keyof ProjectEntry | 'techStack', string>>;

const EMPTY_PROJECT = (): ProjectEntry => ({
  id: '',
  name: '',
  description: '',
  domain: '',
  techStack: [],
  type: 'Personal Project',
  status: 'Ongoing',
});

export function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { addProject, updateProject, getProject } = useProjects();

  const [data, setData] = useState<ProjectEntry>(EMPTY_PROJECT);
  const [techInput, setTechInput] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<{id: string, name: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTeachers().then(setTeachers).catch(console.error);
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      const existing = getProject(id);
      if (existing) {
        setData(existing);
        if (existing.imageUrl) setImagePreview(existing.imageUrl);
      } else {
        /** Fallback: Redirect to the projects index if the requested project ID doesn't exist. */
        navigate('/projects', { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setField = <K extends keyof ProjectEntry>(key: K, value: ProjectEntry[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
    /** Clear specific field validation errors upon user input to provide immediate positive feedback. */
    if (errors[key as keyof Errors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const addTech = () => {
    const val = techInput.trim();
    if (!val) return;
    if (data.techStack.includes(val)) {
      setErrors(prev => ({ ...prev, techStack: `"${val}" is already in the list.` }));
      return;
    }
    setField('techStack', [...data.techStack, val]);
    setTechInput('');
    setErrors(prev => ({ ...prev, techStack: undefined }));
  };

  const removeTech = (tech: string) => {
    setField('techStack', data.techStack.filter(t => t !== tech));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageUrl: 'Image must be under 2MB.' }));
      return;
    }

    // Show a local preview immediately using a temporary blob URL
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setErrors(prev => ({ ...prev, imageUrl: undefined }));
    setIsUploading(true);

    try {
      const url = await uploadFile(file); // real Supabase URL
      setField('imageUrl', url);
      setImagePreview(url);        // swap preview to the durable real URL
      URL.revokeObjectURL(objectUrl); // free the blob now that it's no longer needed
    } catch (err) {
      console.error('Image upload failed', err);
      setErrors(prev => ({ ...prev, imageUrl: 'Upload failed. Try again.' }));
      setImagePreview(null);       // don't leave a dead/broken blob displayed
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!data.name.trim()) newErrors.name = 'Project name is required.';
    if (!data.domain.trim()) newErrors.domain = 'Domain is required.';
    if (data.techStack.length === 0) newErrors.techStack = 'Add at least one technology.';
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      newErrors.endDate = 'End date cannot be before start date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isUploading) {
      setErrors(prev => ({ ...prev, imageUrl: 'Please wait for the image to finish uploading.' }));
      return;
    }
    if (!validate()) return;
    try {
      if (isEditing) {
        await updateProject(data);
      } else {
        await addProject(data);
      }
      navigate('/projects');
    } catch (err) {
      console.error('Failed to save project', err);
    }
  };

  const FieldError = ({ field }: { field: keyof Errors }) =>
    errors[field] ? (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
        <AlertCircle className="w-3 h-3" /> {errors[field]}
      </p>
    ) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-brand-800 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8 space-y-8">

          {/* Image Upload */}
          <div>
            <Label>Project Image</Label>
            <div
              className="mt-1 h-40 w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-brand-700 bg-slate-50 dark:bg-brand-900/50 flex flex-col items-center justify-center hover:bg-slate-100 dark:hover:bg-brand-900 transition-colors cursor-pointer group relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Uploading...</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setImagePreview(null); setField('imageUrl', undefined); }}
                    className="absolute top-2 right-2 p-1 bg-slate-900/60 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-white dark:bg-brand-800 rounded-full shadow-sm mb-2 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-6 h-6 text-brand-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload image</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG or PNG (max 2MB)</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleImageChange}
            />
            <FieldError field="imageUrl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="proj-name">Project Name</Label>
              <input
                id="proj-name"
                type="text"
                placeholder="e.g. Smart IoT Home Monitor"
                value={data.name}
                onChange={e => setField('name', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-brand-500 bg-white dark:bg-brand-950 transition-colors ${errors.name ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-brand-700'}`}
              />
              <FieldError field="name" />
            </div>

            <div>
              <Label htmlFor="proj-domain">Domain</Label>
              <input
                id="proj-domain"
                type="text"
                placeholder="e.g. Web Development"
                value={data.domain}
                onChange={e => setField('domain', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-brand-500 bg-white dark:bg-brand-950 transition-colors ${errors.domain ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-brand-700'}`}
              />
              <FieldError field="domain" />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={data.status} onChange={e => setField('status', e.target.value as ProjectStatus)}>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="proj-desc">Description</Label>
            <Textarea
              id="proj-desc"
              rows={4}
              placeholder="Briefly describe the project goals and your role..."
              value={data.description ?? ''}
              onChange={e => setField('description', e.target.value.slice(0, 300))}
            />
            <p className={`text-xs mt-1 text-right transition-colors ${(data.description ?? '').length >= 280 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
              {(data.description ?? '').length} / 300
            </p>
          </div>

          {/* Tech Stack */}
          <div>
            <Label>Tech Stack</Label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add technology (e.g. React) and press Enter"
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
                className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-brand-700 bg-white dark:bg-brand-950 text-sm focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={addTech}
                className="px-4 py-2.5 bg-slate-100 dark:bg-brand-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-brand-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.techStack.map(tech => (
                <span key={tech} className="flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium bg-slate-100 dark:bg-brand-800 text-slate-700 dark:text-slate-300 rounded-lg">
                  {tech}
                  <button onClick={() => removeTech(tech)} className="text-slate-400 hover:text-red-500 transition-colors" aria-label={`Remove ${tech}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {data.techStack.length === 0 && <span className="text-sm text-slate-500 italic">No technologies added yet.</span>}
            </div>
            <FieldError field="techStack" />
          </div>

          {/* Type + Mentor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-brand-800">
            <div>
              <Label>Project Type</Label>
              <Select value={data.type} onChange={e => setField('type', e.target.value as ProjectType)}>
                <option value="Personal Project">Personal Project</option>
                <option value="College Project">College Project</option>
                <option value="Internship Project">Internship Project</option>
              </Select>
            </div>

            {/* Progressive Disclosure: Mentor only for College Project */}
            <div className={`transition-all duration-300 ${data.type === 'College Project' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <Label htmlFor="proj-mentor">Project Mentor</Label>
              <Select 
                value={data.mentorId || ''} 
                onChange={e => {
                  const selectedTeacher = teachers.find(t => t.id === e.target.value);
                  setData(prev => ({
                    ...prev,
                    mentorId: selectedTeacher?.id || null,
                    mentorName: selectedTeacher?.name || null
                  }));
                }}
              >
                <option value="">Select a Mentor...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="proj-start">Start Date</Label>
              <input
                id="proj-start"
                type="month"
                value={data.startDate || ''}
                onChange={e => setField('startDate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-brand-700 bg-white dark:bg-brand-950 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <Label htmlFor="proj-end">
                End Date {data.status === 'Ongoing' && <span className="text-slate-400 font-normal">(Optional)</span>}
              </Label>
              <input
                id="proj-end"
                type="month"
                value={data.endDate || ''}
                min={data.startDate || undefined}
                onChange={e => setField('endDate', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-brand-500 bg-white dark:bg-brand-950 transition-colors ${errors.endDate ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-brand-700'} ${data.status === 'Ongoing' ? 'opacity-60' : ''}`}
              />
              <FieldError field="endDate" />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isUploading}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isEditing ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </div>
  );
}