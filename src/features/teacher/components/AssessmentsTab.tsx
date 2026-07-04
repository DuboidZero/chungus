import { useState } from 'react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Plus, CheckSquare } from 'lucide-react';
import type { AssessmentMark } from '../../../api/entities/teacher';
import { createStudentMark } from '../../../api/services/teacher';

interface Props {
  marks: AssessmentMark[];
  studentId: string;
}

export function AssessmentsTab({ marks: initialMarks, studentId }: Props) {
  const [marks, setMarks] = useState<AssessmentMark[]>(initialMarks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    assessmentTitle: '',
    score: '',
    maxScore: '',
    comments: '',
    date: new Date().toISOString().split('T')[0], // today as default
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const mark = await createStudentMark(studentId, {
        assessmentTitle: formData.assessmentTitle,
        score: Number(formData.score),
        maxScore: Number(formData.maxScore),
        comments: formData.comments,
        date: formData.date,
      });
      setMarks(prev => [mark, ...prev]);
      setIsFormOpen(false);
      setFormData({ assessmentTitle: '', score: '', maxScore: '', comments: '', date: new Date().toISOString().split('T')[0] });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const generalMarks = marks.filter(m => !m.projectId);
  const projectMarks = marks.filter(m => !!m.projectId);

  const scorePercent = (score: number, max: number) =>
    max > 0 ? Math.round((score / max) * 100) : 0;

  const scoreColor = (pct: number) =>
    pct >= 75 ? 'text-emerald-600 dark:text-emerald-400'
    : pct >= 50 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── General Assessments ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">General Assessments</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Viva scores, participation, semester reviews — not visible to students</p>
          </div>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-container text-white text-sm font-medium rounded-md hover:bg-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isFormOpen ? 'Cancel' : 'Log Assessment'}
          </button>
        </div>

        {isFormOpen && (
          <Card className="border-outline-variant dark:border-outline-variant">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Assessment Title *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Mid-Semester Viva"
                      value={formData.assessmentTitle}
                      onChange={e => setFormData({ ...formData, assessmentTitle: e.target.value })}
                      className="w-full p-2 text-sm bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Date *
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full p-2 text-sm bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Score *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="45"
                      value={formData.score}
                      onChange={e => setFormData({ ...formData, score: e.target.value })}
                      className="w-full p-2 text-sm bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Max Score *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="50"
                      value={formData.maxScore}
                      onChange={e => setFormData({ ...formData, maxScore: e.target.value })}
                      className="w-full p-2 text-sm bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  {formData.score && formData.maxScore && (
                    <div className="flex-none flex items-end pb-2">
                      <span className={`text-lg font-bold ${scoreColor(scorePercent(Number(formData.score), Number(formData.maxScore)))}`}>
                        {scorePercent(Number(formData.score), Number(formData.maxScore))}%
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Comments *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Feedback and observations..."
                    value={formData.comments}
                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 bg-primary-container text-white text-sm font-medium rounded-md hover:bg-primary disabled:opacity-50"
                  >
                    <CheckSquare className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Save Assessment'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {generalMarks.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No general assessments recorded yet.
            </p>
          ) : (
            generalMarks.map(mark => {
              const pct = scorePercent(mark.score, mark.maxScore);
              return (
                <Card key={mark.id}>
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{mark.assessmentTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        By {mark.teacherName} · {new Date(mark.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{mark.comments}</p>
                    </div>
                    <div className="shrink-0 text-center min-w-[80px]">
                      <div className={`text-2xl font-bold ${scoreColor(pct)}`}>
                        {mark.score}<span className="text-base text-slate-400">/{mark.maxScore}</span>
                      </div>
                      <div className={`text-xs font-semibold mt-0.5 ${scoreColor(pct)}`}>{pct}%</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* ── Project-Level Marks ──────────────────────────────────────────── */}
      {projectMarks.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Project Assessments</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Marks attached to specific project entries</p>
          </div>
          <div className="space-y-3">
            {projectMarks.map(mark => {
              const pct = scorePercent(mark.score, mark.maxScore);
              return (
                <Card key={mark.id} className="border-purple-100 dark:border-purple-900/30">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded font-medium">
                          Project Mark
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{mark.assessmentTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        By {mark.teacherName} · {new Date(mark.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{mark.comments}</p>
                    </div>
                    <div className="shrink-0 text-center min-w-[80px]">
                      <div className={`text-2xl font-bold ${scoreColor(pct)}`}>
                        {mark.score}<span className="text-base text-slate-400">/{mark.maxScore}</span>
                      </div>
                      <div className={`text-xs font-semibold mt-0.5 ${scoreColor(pct)}`}>{pct}%</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
