import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { DeleteConfirmModal } from '../../shared/ui/modal';
import { AddTechnicalSkillModal, AddSoftSkillModal, AddLanguageModal } from './SkillForms';
import type { SkillsData } from './types';
import { getSkills, createTechnicalSkill, createSoftSkill, createLanguageSkill, deleteSkill } from '../../api/services/skills';
import { Skeleton } from '../../shared/ui/loading-skeleton';

/** Fetches the skill taxonomy and proficiency levels from the backend service. */
const EMPTY_SKILLS: SkillsData = {
  technical: [],
  soft: [],
  languages: [],
};

export function Skills() {
  const [data, setData] = useState<SkillsData>(EMPTY_SKILLS);
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({ tech: false, soft: false, lang: false });
  const [deleting, setDeleting] = useState<{ id: string, type: keyof SkillsData, name: string } | null>(null);

  useEffect(() => {
    getSkills()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteSkill(deleting.type, deleting.id);
      setData(prev => ({
        ...prev,
        [deleting.type]: (prev[deleting.type] as any[]).filter(s => s.id !== deleting.id)
      }));
      setDeleting(null);
    } catch (err) {
      console.error('Failed to delete skill', err);
    }
  };
  /** Extract unique domains to group technical skills categorically. */
  const domains = Array.from(new Set(data.technical.map(t => t.domain)));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Skills &amp; Competencies</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your technical arsenal, soft skills, and languages.</p>
      </div>

      {/* ── Technical Skills ── */}
      <Card>
        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Technical Skills</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Categorised by domain of interest.</p>
            </div>
            <button onClick={() => setModals({ ...modals, tech: true })} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 shrink-0">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {domains.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-4 text-center">No technical skills added yet.</p>
          ) : (
            <div className="space-y-5">
              {domains.map(domain => (
                <div key={domain} className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{domain}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {data.technical.filter(t => t.domain === domain).map(skill => (
                      <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-brand-800 bg-slate-50 dark:bg-brand-900/50 group">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{skill.name}</p>
                            <Badge variant="default" className="text-[9px] px-1 py-0 uppercase opacity-70">Self-assessed</Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Level {skill.proficiency}/5</p>
                        </div>
                        <button onClick={() => setDeleting({ id: skill.id, type: 'technical', name: skill.name })} className="p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Soft Skills ── */}
      <Card>
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Soft Skills</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Interpersonal and professional competencies.</p>
            </div>
            <button onClick={() => setModals({ ...modals, soft: true })} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 shrink-0">
              <Plus className="w-4 h-4" /> Add Soft Skill
            </button>
          </div>

          {data.soft.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-4 text-center">No soft skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {data.soft.map(skill => (
                <div key={skill.id} className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border border-slate-200 dark:border-brand-800 bg-slate-50 dark:bg-brand-900/50">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{skill.name}</span>
                  {skill.proficiency && <Badge variant="info">Lvl {skill.proficiency}</Badge>}
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide bg-white dark:bg-brand-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-brand-700">Self-assessed</span>
                  <button onClick={() => setDeleting({ id: skill.id, type: 'soft', name: skill.name })} className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-brand-800 rounded-full transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Languages ── */}
      <Card>
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Languages</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Languages you can communicate in.</p>
            </div>
            <button onClick={() => setModals({ ...modals, lang: true })} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 shrink-0">
              <Plus className="w-4 h-4" /> Add Language
            </button>
          </div>

          {data.languages.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-4 text-center">No languages added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {data.languages.map(lang => (
                <div key={lang.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-brand-800 bg-slate-50 dark:bg-brand-900/50 group">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{lang.name}</p>
                    <Badge variant="success" className="mt-1">{lang.proficiency}</Badge>
                  </div>
                  <button onClick={() => setDeleting({ id: lang.id, type: 'languages', name: lang.name })} className="p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddTechnicalSkillModal
        isOpen={modals.tech}
        onClose={() => setModals({ ...modals, tech: false })}
        onSave={async (s) => {
          try {
            const created = await createTechnicalSkill(s);
            setData(prev => ({ ...prev, technical: [...prev.technical, created] }));
          } catch (err) { console.error('Failed to add technical skill', err); }
        }}
      />
      <AddSoftSkillModal
        isOpen={modals.soft}
        onClose={() => setModals({ ...modals, soft: false })}
        onSave={async (s) => {
          try {
            const created = await createSoftSkill(s);
            setData(prev => ({ ...prev, soft: [...prev.soft, created] }));
          } catch (err) { console.error('Failed to add soft skill', err); }
        }}
      />
      <AddLanguageModal
        isOpen={modals.lang}
        onClose={() => setModals({ ...modals, lang: false })}
        onSave={async (s) => {
          try {
            const created = await createLanguageSkill(s);
            setData(prev => ({ ...prev, languages: [...prev.languages, created] }));
          } catch (err) { console.error('Failed to add language', err); }
        }}
      />
      <DeleteConfirmModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        entityName={deleting?.name || ''}
      />
    </div>
  );
}
