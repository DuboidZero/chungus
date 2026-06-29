import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/card';
import type { AssessmentMark } from '../../../api/entities/teacher';

interface Props {
  marks: AssessmentMark[];
  onAddMark: (mark: { assessmentTitle: string; score: number; maxScore: number; comments: string; date: string }) => void;
}

export function ProjectAssessmentPanel({ marks, onAddMark }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ title: '', score: '', maxScore: '', comments: '', date: new Date().toISOString().split('T')[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMark({
      assessmentTitle: form.title,
      score: Number(form.score),
      maxScore: Number(form.maxScore),
      comments: form.comments,
      date: form.date
    });
    setIsFormOpen(false);
    setForm({ title: '', score: '', maxScore: '', comments: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-500" /> Assessment History
        </h3>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
          {isFormOpen ? 'Cancel' : '+ Add Assessment'}
        </button>
      </div>

      {isFormOpen && (
        <Card className="border-emerald-200 dark:border-emerald-900/50">
          <CardContent className="p-4 sm:p-5 bg-emerald-50/30 dark:bg-emerald-900/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assessment Title</label>
                  <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Score</label>
                  <input required type="number" min="0" value={form.score} onChange={e => setForm({...form, score: e.target.value})} className="w-full p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Score</label>
                  <input required type="number" min="1" value={form.maxScore} onChange={e => setForm({...form, maxScore: e.target.value})} className="w-full p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Comments</label>
                <textarea required value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} className="w-full h-20 p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700">Save Assessment</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {marks.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-200 dark:border-brand-800 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No assessments logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {marks.map(mark => (
            <Card key={mark.id} className="border-slate-200 dark:border-brand-800">
              <CardContent className="p-4 flex gap-4 justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{mark.assessmentTitle}</h4>
                  <p className="text-xs text-slate-500 mb-2">Evaluated by {mark.teacherName} on {new Date(mark.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{mark.comments}</p>
                </div>
                <div className="shrink-0 text-center">
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{mark.score}<span className="text-sm text-slate-400">/{mark.maxScore}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
