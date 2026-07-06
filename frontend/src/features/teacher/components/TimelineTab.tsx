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
      case 'NOTE':              return <FileText  className="w-4 h-4 text-primary" />;
      case 'MARK':              return <CheckSquare className="w-4 h-4 text-emerald-600" />;
      case 'PROJECT_MILESTONE': return <Flag      className="w-4 h-4 text-purple-600" />;
      case 'ACHIEVEMENT':       return <Activity  className="w-4 h-4 text-amber-600" />;
      case 'SKILL_ADD':         return <Zap       className="w-4 h-4 text-cyan-600" />;
      case 'GUIDANCE_CASE':     return <Shield    className="w-4 h-4 text-red-500" />;
      case 'SYSTEM_UPDATE':
      default:                  return <Clock     className="w-4 h-4 text-on-surface-variant/70" />;
    }
  };

  const getEventBg = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'NOTE':              return 'bg-primary-fixed border-outline-variant';
      case 'MARK':              return 'bg-emerald-100 border-emerald-200';
      case 'PROJECT_MILESTONE': return 'bg-purple-100 border-purple-200';
      case 'ACHIEVEMENT':       return 'bg-amber-100 border-amber-200';
      case 'SKILL_ADD':         return 'bg-cyan-100 border-cyan-200';
      case 'GUIDANCE_CASE':     return 'bg-red-100 border-red-200';
      default:                  return 'bg-surface-container border-outline-variant';
    }
  };

  const getCardBg = (event: TimelineEvent) =>
    event.isTeacherInitiated
      ? 'bg-surface-container-low/60 border-outline-variant/60'
      : 'bg-white border-outline-variant';

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
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row gap-6 justify-between">
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">CGPA</p>
              <p className="text-2xl font-bold text-on-surface">{snapshot.cgpa?.toFixed(2) ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Projects</p>
              <p className="text-2xl font-bold text-on-surface">{snapshot.projectCount ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Semesters Completed</p>
              <p className="text-2xl font-bold text-on-surface">{snapshot.semesterCount ?? '—'}</p>
            </div>
          </div>
          <div className="w-px bg-outline-variant/50 hidden md:block" />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Teacher Interactions</p>
              <p className="text-2xl font-bold text-primary">{snapshot.interactions ?? '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Last Activity</p>
              <p className="text-sm font-semibold text-on-surface mt-1.5">
                {snapshot.lastInteraction ? new Date(snapshot.lastInteraction).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'None recorded'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-outline-variant p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
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
                  ? 'bg-primary-container text-white'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Date range */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => handleDateChange(e.target.value, toDate)}
              className="text-xs p-1.5 bg-surface-container-low border border-outline-variant rounded text-on-surface"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant">To</label>
            <input
              type="date"
              value={toDate}
              onChange={e => handleDateChange(fromDate, e.target.value)}
              className="text-xs p-1.5 bg-surface-container-low border border-outline-variant rounded text-on-surface"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant">Teacher</label>
            <input
              type="text"
              placeholder="Name..."
              value={teacherFilter}
              onChange={e => handleTeacherChange(e.target.value)}
              className="text-xs p-1.5 w-28 bg-surface-container-low border border-outline-variant rounded text-on-surface"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant">Semester</label>
            <input
              type="text"
              placeholder="e.g. S1"
              value={semesterFilter}
              onChange={e => handleSemesterChange(e.target.value)}
              className="text-xs p-1.5 w-16 bg-surface-container-low border border-outline-variant rounded text-on-surface"
            />
          </div>
          {(fromDate || toDate || typeFilter !== 'ALL' || teacherFilter || semesterFilter) && (
            <button
              onClick={() => { setTypeFilter('ALL'); setFromDate(''); setToDate(''); setTeacherFilter(''); setSemesterFilter(''); setEvents(initialEvents); }}
              className="text-xs text-on-surface-variant hover:text-on-surface underline ml-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div className="flex gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary-fixed border border-outline-variant" />
          Teacher activity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white border border-outline-variant" />
          Student activity
        </span>
      </div>

      {/* ── Timeline ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center text-on-surface-variant py-8 text-sm animate-pulse">Loading timeline…</div>
      ) : events.length === 0 ? (
        <div className="text-center text-on-surface-variant py-12">
          No activity matches the selected filters.
        </div>
      ) : (
        <div className="relative pl-6 py-2">
          {/* Vertical connector */}
          <div className="absolute top-0 bottom-0 left-[35px] w-[2px] bg-surface-container-high" />

          <div className="space-y-6">
            {grouped.map(group => (
              <div key={group.date}>
                {/* Date header */}
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="relative z-10 w-8 h-8 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-surface-container-high" />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low px-2 py-0.5 rounded">
                    {group.date}
                  </span>
                </div>

                {/* Events in this date group */}
                <div className="space-y-4">
                  {group.events.map((event, idx) => (
                    <div key={event.id || idx} className="relative flex gap-6">
                      <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 shadow-sm bg-white ${getEventBg(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className={`flex-1 rounded-lg border p-4 shadow-sm ${getCardBg(event)}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-1">
                          <h4 className="font-semibold text-sm text-on-surface">{event.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                            <span>by {event.author}</span>
                            {event.isTeacherInitiated && (
                              <span className="px-1.5 py-0.5 bg-primary-fixed text-primary rounded text-[10px] font-semibold uppercase tracking-wider">
                                Teacher
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-on-surface-variant whitespace-pre-wrap">
                          {event.description}
                        </p>
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-outline-variant/40 flex flex-wrap gap-3">
                            {Object.entries(event.metadata)
                              .filter(([, v]) => v !== null && v !== undefined)
                              .map(([key, value]) => (
                                <span key={key} className="text-xs text-on-surface-variant font-mono">
                                  <strong className="text-on-surface-variant">{key}:</strong> {String(value)}
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
