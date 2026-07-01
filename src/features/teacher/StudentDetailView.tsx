/**
 * Teacher Workspace — Student Detail View
 * 
 * The teacher's primary workspace for a specific student.
 * Reuses the exact student-facing dashboard UI (via StudentDashboardView),
 * then layers teacher-only panels: Private Notes, Timeline, Assessments.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Activity, Clock, FileText, CheckSquare, User, FolderGit2 } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

import { OverviewTab } from './components/OverviewTab';
import { TimelineTab } from './components/TimelineTab';
import { NotesTab } from './components/NotesTab';
import { AssessmentsTab } from './components/AssessmentsTab';
import { ProjectsTab } from './components/ProjectsTab';
import { getStudentDashboard } from '../../api/services/dashboard';
import { getStudentTimeline, getStudentNotes, getStudentMarks, getStudentUser } from '../../api/services/teacher';
import type { StudentDashboardResponse } from '../../api/contracts/dashboard';
import type { StudentTimelineResponse } from '../../api/contracts/teacher';
import type { PrivateNote, AssessmentMark, PerformanceTier } from '../../api/entities/teacher';
import { Skeleton } from '../../shared/ui/loading-skeleton';
import { Card, CardContent } from '../../shared/ui/card';

type TabType = 'overview' | 'timeline' | 'notes' | 'assessments' | 'projects';

interface StudentUser {
  id: string;
  name: string;
  prn: string;
  role: string;
  avatar?: string | null;
}

export function StudentDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);

  const [studentUser, setStudentUser] = useState<StudentUser | null>(null);
  const [overview, setOverview] = useState<StudentDashboardResponse | null>(null);
  const [timeline, setTimeline] = useState<StudentTimelineResponse>([]);
  const [notes, setNotes] = useState<PrivateNote[]>([]);
  const [marks, setMarks] = useState<AssessmentMark[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getStudentUser(id).then(u => setStudentUser(u as StudentUser | null)),
      getStudentDashboard(id).then(setOverview),
      getStudentTimeline(id).then(res => setTimeline(res || [])),
      getStudentNotes(id).then(setNotes),
      getStudentMarks(id).then(setMarks),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const getTierColor = (tier?: PerformanceTier | string) => {
    if (!tier) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    switch (tier) {
      case 'High Performing': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Average - Guidable': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Underperforming': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const cgpa = overview?.stats?.cgpa;
  const tier = cgpa !== undefined
    ? cgpa >= 8.5 ? 'High Performing' : cgpa >= 6.5 ? 'Average - Guidable' : 'Underperforming'
    : undefined;

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'notes', label: 'Private Notes', icon: FileText },
    { id: 'assessments', label: 'Assessments', icon: CheckSquare },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/students')}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-800 text-slate-500 transition-colors"
          title="Back to My Students"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase mb-0.5">My Students</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {studentUser?.name || 'Student'}
          </h1>
        </div>
      </div>

      {/* Student Identity Banner */}
      <Card className="border-slate-200 dark:border-brand-800">
        <CardContent className="p-5 flex flex-wrap items-center gap-6">
          {/* Avatar */}
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
            {studentUser?.avatar ? (
              <img src={studentUser.avatar} alt={studentUser.name} className="w-full h-full object-cover" />
            ) : (
              studentUser?.name?.charAt(0) ?? <User className="w-6 h-6" />
            )}
          </div>
          {/* Core Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {studentUser?.name ?? '—'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="font-mono text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-brand-900/50 px-2 py-0.5 rounded">
                {studentUser?.prn ?? id}
              </span>
              {tier && (
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getTierColor(tier)}`}>
                  {tier}
                </span>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="flex gap-6 shrink-0">
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">CGPA</p>
              <p className={`text-2xl font-bold ${cgpa !== undefined ? (cgpa >= 8.5 ? 'text-emerald-600 dark:text-emerald-400' : cgpa < 6.0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400') : 'text-slate-900 dark:text-slate-100'}`}>
                {cgpa !== undefined ? cgpa.toFixed(2) : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Projects</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {overview?.stats?.projectCount ?? '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Skills</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {overview?.stats?.skillCount ?? '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Achievements</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {overview?.stats?.achievementCount ?? '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-brand-800 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'notes' && notes.length > 0 && (
              <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
                {notes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'overview'     && <OverviewTab data={overview} />}
        {activeTab === 'timeline'     && (
          <TimelineTab 
            events={timeline} 
            studentId={id} 
            snapshot={{
              cgpa: overview?.stats?.cgpa,
              projectCount: overview?.stats?.projectCount,
              interactions: timeline.filter(e => e.isTeacherInitiated).length,
              lastInteraction: timeline.filter(e => e.isTeacherInitiated)?.[0]?.date,
              trend: 'up'
            }}
          />
        )}
        {activeTab === 'projects'     && <ProjectsTab studentId={id!} />}
        {activeTab === 'notes'        && <NotesTab notes={notes} studentId={id!} currentTeacherId={user?.id} />}
        {/* Always mounted to preserve state — tabs just hide/show via CSS */}
        <div className={activeTab === 'assessments' ? '' : 'hidden'}>
          <AssessmentsTab marks={marks} studentId={id!} />
        </div>
      </div>
    </div>
  );
}
