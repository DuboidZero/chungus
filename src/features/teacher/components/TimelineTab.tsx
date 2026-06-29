import { useState } from 'react';
import { Clock, FileText, CheckSquare, Flag, Activity, Zap, Shield, Filter } from 'lucide-react';
import type { TimelineEvent } from '../../../api/contracts/teacher';
import { getStudentTimeline } from '../../../api/services/teacher';

type EventFilter = TimelineEvent['type'] | 'ALL';

const EVENT_TYPES: { value: EventFilter; label: string }[] = [
  { value: 'ALL',               label: 'All Activity' },
  { value: 'NOTE',              label: 'Teacher Notes' },
  { value: 'MARK',              label: 'Marks' },
  { value: 'PROJECT_MILESTONE', label: 'Milestones' },
  { value: 'ACHIEVEMENT',       label: 'Achievements' },
  { value: 'SKILL_ADD',         label: 'Skills' },
];

interface Props {
  events: TimelineEvent[];
  studentId?: string;
  snapshot?: {
    cgpa?: number;
    projectCount?: number;
    semesterCount?: number;
    interactions?: number;
    lastInteraction?: string;
    trend?: 'up' | 'down' | 'flat';
  };
}

export function TimelineTab({ events: initialEvents, studentId, snapshot }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [typeFilter, setTypeFilter] = useState<EventFilter>('ALL');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const applyFilters = async (type: EventFilter, from: string, to: string, teacher: string, sem: string) => {
    if (!studentId) {
      // Client-side filter only
      let filtered = initialEvents;
      if (type !== 'ALL') filtered = filtered.filter(e => e.type === type);
      if (from) filtered = filtered.filter(e => new Date(e.date) >= new Date(from));
      if (to)   filtered = filtered.filter(e => new Date(e.date) <= new Date(to));
      if (teacher) filtered = filtered.filter(e => e.author.toLowerCase().includes(teacher.toLowerCase()));
      if (sem) filtered = filtered.filter(e => e.metadata?.semester === sem);
      setEvents(filtered);
      return;
    }
    setLoading(true);
    try {
      const data = await getStudentTimeline(studentId, {
        type: type !== 'ALL' ? type : undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (v: EventFilter) => {
    setTypeFilter(v);
    applyFilters(v, fromDate, toDate, teacherFilter, semesterFilter);
  };

  const handleDateChange = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    applyFilters(typeFilter, from, to, teacherFilter, semesterFilter);
  };

  const handleTeacherChange = (teacher: string) => {
    setTeacherFilter(teacher);
    applyFilters(typeFilter, fromDate, toDate, teacher, semesterFilter);
  };

  const handleSemesterChange = (sem: string) => {
    setSemesterFilter(sem);
    applyFilters(typeFilter, fromDate, toDate, teacherFilter, sem);
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'NOTE':              return <FileText  className="w-4 h-4 text-brand-600 dark:text-brand-400" />;
      case 'MARK':              return <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'PROJECT_MILESTONE': return <Flag      className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'ACHIEVEMENT':       return <Activity  className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'SKILL_ADD':         return <Zap       className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'GUIDANCE_CASE':     return <Shield    className="w-4 h-4 text-red-500 dark:text-red-400" />;
      case 'SYSTEM_UPDATE':
      default:                  return <Clock     className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventBg = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'NOTE':              return 'bg-brand-100 dark:bg-brand-900/50 border-brand-200 dark:border-brand-800';
      case 'MARK':              return 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800';
      case 'PROJECT_MILESTONE': return 'bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800';
      case 'ACHIEVEMENT':       return 'bg-amber-100 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800';
      case 'SKILL_ADD':         return 'bg-cyan-100 dark:bg-cyan-900/50 border-cyan-200 dark:border-cyan-800';
      case 'GUIDANCE_CASE':     return 'bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800';
      default:                  return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const getCardBg = (event: TimelineEvent) =>
    event.isTeacherInitiated
      ? 'bg-brand-50/50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-900/30'
      : 'bg-white dark:bg-brand-950/40 border-slate-200 dark:border-brand-800';

  // Group events by date for visual date separators
  const grouped: { date: string; events: TimelineEvent[] }[] = [];
  for (const event of events) {
    const dateKey = new Date(event.date).toLocaleDateString(undefined, {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    const last = grouped[grouped.length - 1];
    if (last && last.date === dateKey) {
      last.events.push(event);
    } else {
      grouped.push({ date: dateKey, events: [event] });
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Student Snapshot ───────────────────────────────────────────── */}
      {snapshot && (
        <div className="bg-slate-900 dark:bg-brand-900 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex-1 z-10 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">CGPA</p>
              <p className="text-2xl font-bold text-white">{snapshot.cgpa?.toFixed(2) ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Projects</p>
              <p className="text-2xl font-bold text-white">{snapshot.projectCount ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Semesters Completed</p>
              <p className="text-2xl font-bold text-white">{snapshot.semesterCount ?? '—'}</p>
            </div>
          </div>
          <div className="w-px bg-slate-700 dark:bg-brand-800 hidden md:block z-10" />
          <div className="flex-1 z-10 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Teacher Interactions</p>
              <p className="text-2xl font-bold text-brand-300">{snapshot.interactions ?? '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Last Activity</p>
              <p className="text-sm font-semibold text-white mt-1.5">
                {snapshot.lastInteraction ? new Date(snapshot.lastInteraction).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'None recorded'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-brand-900/40 rounded-lg border border-slate-200 dark:border-brand-800 p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          Filters
        </div>
        {/* Type pills */}
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                typeFilter === t.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-brand-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-brand-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Date range */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => handleDateChange(e.target.value, toDate)}
              className="text-xs p-1.5 bg-slate-50 dark:bg-brand-950/50 border border-slate-200 dark:border-brand-800 rounded text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">To</label>
            <input
              type="date"
              value={toDate}
              onChange={e => handleDateChange(fromDate, e.target.value)}
              className="text-xs p-1.5 bg-slate-50 dark:bg-brand-950/50 border border-slate-200 dark:border-brand-800 rounded text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Teacher</label>
            <input
              type="text"
              placeholder="Name..."
              value={teacherFilter}
              onChange={e => handleTeacherChange(e.target.value)}
              className="text-xs p-1.5 w-28 bg-slate-50 dark:bg-brand-950/50 border border-slate-200 dark:border-brand-800 rounded text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Semester</label>
            <input
              type="text"
              placeholder="e.g. S1"
              value={semesterFilter}
              onChange={e => handleSemesterChange(e.target.value)}
              className="text-xs p-1.5 w-16 bg-slate-50 dark:bg-brand-950/50 border border-slate-200 dark:border-brand-800 rounded text-slate-900 dark:text-slate-100"
            />
          </div>
          {(fromDate || toDate || typeFilter !== 'ALL' || teacherFilter || semesterFilter) && (
            <button
              onClick={() => { setTypeFilter('ALL'); setFromDate(''); setToDate(''); setTeacherFilter(''); setSemesterFilter(''); setEvents(initialEvents); }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline ml-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-brand-100 dark:bg-brand-900/50 border border-brand-200 dark:border-brand-800" />
          Teacher activity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white dark:bg-brand-950/40 border border-slate-200 dark:border-brand-800" />
          Student activity
        </span>
      </div>

      {/* ── Timeline ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm animate-pulse">Loading timeline…</div>
      ) : events.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-12">
          No activity matches the selected filters.
        </div>
      ) : (
        <div className="relative pl-6 py-2">
          {/* Vertical connector */}
          <div className="absolute top-0 bottom-0 left-[35px] w-[2px] bg-slate-200 dark:bg-brand-800/50" />

          <div className="space-y-6">
            {grouped.map(group => (
              <div key={group.date}>
                {/* Date header */}
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="relative z-10 w-8 h-8 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                    {group.date}
                  </span>
                </div>

                {/* Events in this date group */}
                <div className="space-y-4">
                  {group.events.map((event, idx) => (
                    <div key={event.id || idx} className="relative flex gap-6">
                      <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 shadow-sm bg-white dark:bg-brand-950 ${getEventBg(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className={`flex-1 rounded-lg border p-4 shadow-sm ${getCardBg(event)}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-1">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{event.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>by {event.author}</span>
                            {event.isTeacherInitiated && (
                              <span className="px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 rounded text-[10px] font-semibold uppercase tracking-wider">
                                Teacher
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                          {event.description}
                        </p>
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap gap-3">
                            {Object.entries(event.metadata)
                              .filter(([, v]) => v !== null && v !== undefined)
                              .map(([key, value]) => (
                                <span key={key} className="text-xs text-slate-500 font-mono">
                                  <strong className="text-slate-700 dark:text-slate-300">{key}:</strong> {String(value)}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
