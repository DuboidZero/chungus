import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

import { ProjectOverview } from './components/ProjectOverview';
import { ProjectAssessmentPanel } from './components/ProjectAssessmentPanel';
import { ProjectMilestonesPanel } from './components/ProjectMilestonesPanel';
import { ProjectTimeline } from './components/ProjectTimeline';

import type { Project } from '../../api/entities/project';
import type { AssessmentMark, ProjectMilestone, MilestoneStatus } from '../../api/entities/teacher';
import { getProject } from '../../api/services/projects';
import { getTeacherProjectDetail, getProjectMarks, getProjectMilestones, createProjectMark, createProjectMilestone } from '../../api/services/teacher';
import { Skeleton } from '../../shared/ui/loading-skeleton';

export function ProjectDetail() {
  const { id, studentId, projectId } = useParams<{ id?: string; studentId?: string; projectId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  // Depending on router matching, id might be projectId (student route) or projectId might be from teacher route
  const resolvedProjectId = projectId || id;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [marks, setMarks] = useState<AssessmentMark[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);

  useEffect(() => {
    if (!resolvedProjectId) return;
    setLoading(true);

    const fetchPromises: Promise<any>[] = [];
    
    if (isTeacher) {
      fetchPromises.push(
        getTeacherProjectDetail(resolvedProjectId).then(setProject),
        getProjectMarks(resolvedProjectId).then(setMarks),
        getProjectMilestones(resolvedProjectId).then(setMilestones)
      );
    } else {
      fetchPromises.push(
        getProject(resolvedProjectId).then(setProject)
      );
    }

    Promise.all(fetchPromises)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resolvedProjectId, isTeacher]);

  const handleAddMark = async (markData: { assessmentTitle: string; score: number; maxScore: number; comments: string; date: string }) => {
    if (!resolvedProjectId) return;
    try {
      const newMark = await createProjectMark(resolvedProjectId, markData);
      setMarks(prev => [newMark, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMilestone = async (msData: { description: string; status: MilestoneStatus; date: string }) => {
    if (!resolvedProjectId) return;
    try {
      const newMs = await createProjectMilestone(resolvedProjectId, msData);
      setMilestones(prev => [newMs, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-20 text-slate-500">Project not found.</div>;
  }

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Breadcrumbs / Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-surface-container text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          {isTeacher && studentId ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">
              Teacher Portal &gt; Student Detail &gt; Projects
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">
              Portfolio
            </p>
          )}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h1>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isTeacher ? 'lg:grid-cols-2 gap-8' : 'gap-6'}`}>
        {/* Left Column: Core Project Content & Timeline (Shared) */}
        <div className="space-y-8">
          <ProjectOverview project={project} />
          {/* Always show the timeline for everyone, containing assessments and milestones */}
          <ProjectTimeline marks={marks} milestones={milestones} />
        </div>

        {/* Right Column: Teacher Workspace (Only visible to teachers) */}
        {isTeacher && (
          <div className="space-y-8 bg-slate-50 dark:bg-surface-container-low/40 p-6 rounded-xl border border-slate-200 dark:border-outline-variant">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 border-b border-slate-200 dark:border-outline-variant pb-2">
                Teacher Workspace
              </h2>
            </div>
            
            <ProjectAssessmentPanel marks={marks} onAddMark={handleAddMark} />
            <ProjectMilestonesPanel milestones={milestones} onAddMilestone={handleAddMilestone} />
          </div>
        )}
      </div>
    </div>
  );
}
