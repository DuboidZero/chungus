import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Search, CheckSquare, X, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Skeleton } from '../../shared/ui/loading-skeleton';
import { getAllMarks, getAssignedStudents, createStudentMark } from '../../api/services/teacher';
import type { AssessmentMark } from '../../api/entities/teacher';
import type { StudentSummary } from '../../api/entities/teacher';

type EnrichedMark = AssessmentMark & { studentName: string; studentPrn: string };

export function AssessmentsView() {
  const navigate = useNavigate();
  const [marks, setMarks] = useState<EnrichedMark[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    assessmentTitle: '',
    score: '',
    maxScore: '',
    comments: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    Promise.all([
      getAllMarks(),
      getAssignedStudents({}),
    ])
      .then(([m, s]) => {
        setMarks(m);
        setStudents(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return marks;
    return marks.filter(m =>
      m.assessmentTitle.toLowerCase().includes(q) ||
      m.studentName.toLowerCase().includes(q) ||
      m.comments.toLowerCase().includes(q)
    );
  }, [marks, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) return;
    setSaving(true);
    try {
      const mark = await createStudentMark(form.studentId, {
        assessmentTitle: form.assessmentTitle,
        score: Number(form.score),
        maxScore: Number(form.maxScore),
        comments: form.comments,
        date: form.date,
      });
      // Enrich the new mark with the student name
      const student = students.find(s => s.id === form.studentId);
      const enriched = { ...mark, studentName: student?.name ?? form.studentId, studentPrn: student?.prn ?? '' };
      setMarks(prev => [enriched as EnrichedMark, ...prev]);
      setIsFormOpen(false);
      setForm({ studentId: '', assessmentTitle: '', score: '', maxScore: '', comments: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const scorePercent = (score: number, max: number) => max > 0 ? Math.round((score / max) * 100) : 0;
  const scoreColor = (pct: number) =>
    pct >= 75 ? 'text-emerald-600' :
    pct >= 50 ? 'text-amber-600' :
    'text-red-600';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Assessments</h1>
          <p className="text-on-surface-variant mt-1">
            All assessment marks you've logged across your students.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-container hover:bg-primary text-white font-semibold rounded-lg transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Assessment
        </button>
      </div>

      {/* New Assessment Form */}
      {isFormOpen && (
        <Card className="border-outline-variant shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                Log New Assessment
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant/70">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student selector */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Student *</label>
                <select
                  required
                  value={form.studentId}
                  onChange={e => setForm({ ...form, studentId: e.target.value })}
                  className="w-full p-2 text-sm bg-surface-container-low border border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-on-surface"
                >
                  <option value="">Select a student…</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.prn})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Assessment Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Mid-Semester Viva"
                    value={form.assessmentTitle}
                    onChange={e => setForm({ ...form, assessmentTitle: e.target.value })}
                    className="w-full p-2 text-sm bg-surface-container-low border border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2 text-sm bg-surface-container-low border border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-on-surface"
                  />
                </div>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Score *</label>
                  <input required type="number" min="0" placeholder="45" value={form.score}
                    onChange={e => setForm({ ...form, score: e.target.value })}
                    className="w-full p-2 text-sm bg-surface-container-low border border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-on-surface" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Max Score *</label>
                  <input required type="number" min="1" placeholder="50" value={form.maxScore}
                    onChange={e => setForm({ ...form, maxScore: e.target.value })}
                    className="w-full p-2 text-sm bg-surface-container-low border border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-on-surface" />
                </div>
                {form.score && form.maxScore && (
                  <div className="pb-2">
                    <span className={`text-xl font-bold ${scoreColor(scorePercent(Number(form.score), Number(form.maxScore)))}`}>
                      {scorePercent(Number(form.score), Number(form.maxScore))}%
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Comments *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Feedback and observations…"
                  value={form.comments}
                  onChange={e => setForm({ ...form, comments: e.target.value })}
                  className="w-full p-2 text-sm bg-surface-container-low border border-outline-variant rounded-md focus:ring-2 focus:ring-primary text-on-surface resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container rounded-md transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-primary-container text-white text-sm font-medium rounded-md hover:bg-primary disabled:opacity-50 transition-colors">
                  <CheckSquare className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
        <input
          type="text"
          placeholder="Search by student name, assessment title, or comments…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary text-on-surface shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Marks Count */}
      {!loading && (
        <p className="text-sm text-on-surface-variant">
          {filtered.length === marks.length
            ? `${marks.length} assessment${marks.length !== 1 ? 's' : ''} logged`
            : `Showing ${filtered.length} of ${marks.length}`}
        </p>
      )}

      {/* Marks List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-outline-variant">
          <BookOpen className="w-10 h-10 text-on-surface-variant/60 mx-auto mb-3" />
          <p className="text-on-surface-variant font-medium">
            {search ? 'No assessments match your search.' : 'No assessments logged yet.'}
          </p>
          {!search && (
            <p className="text-sm text-on-surface-variant/70 mt-1">Click "New Assessment" to log your first mark.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(mark => {
            const pct = scorePercent(mark.score, mark.maxScore);
            return (
              <Card key={mark.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/students/${mark.studentId}`)}>
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-on-surface">{mark.assessmentTitle}</h3>
                      {mark.projectId && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                          Project Mark
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
                      <span className="font-medium text-on-surface-variant">{mark.studentName}</span>
                      <span>·</span>
                      <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded">{mark.studentPrn}</span>
                      <span>·</span>
                      <span>{new Date(mark.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{mark.comments}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center min-w-[70px]">
                      <div className={`text-2xl font-bold ${scoreColor(pct)}`}>
                        {mark.score}<span className="text-base text-on-surface-variant/70">/{mark.maxScore}</span>
                      </div>
                      <div className={`text-xs font-semibold mt-0.5 ${scoreColor(pct)}`}>{pct}%</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-on-surface-variant/60 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
