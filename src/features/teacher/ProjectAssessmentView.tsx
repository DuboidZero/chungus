import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FolderGit2, CheckSquare, Flag } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Skeleton } from '../../shared/ui/loading-skeleton';

import type { Project } from '../../api/entities/project';
import type { AssessmentMark, ProjectMilestone, MilestoneStatus } from '../../api/entities/teacher';
import {
  getTeacherProjectDetail,
  getProjectMarks,
  getProjectMilestones,
  createProjectMark,
  createProjectMilestone,
} from '../../api/services/teacher';

export function ProjectAssessmentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [project, setProject] = useState<Project | null>(null);
  const [marks, setMarks] = useState<AssessmentMark[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);

  const [isMarkFormOpen, setIsMarkFormOpen] = useState(false);
  const [markForm, setMarkForm] = useState({ title: '', score: '', maxScore: '', comments: '' });

  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState<{description: string, status: MilestoneStatus, date: string}>({ description: '', status: 'On Track', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getTeacherProjectDetail(id).then(setProject),
      getProjectMarks(id).then(setMarks).catch(() => setMarks([])),
      getProjectMilestones(id).then(setMilestones).catch(() => setMilestones([])),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const created = await createProjectMark(id, {
        assessmentTitle: markForm.title,
        score: Number(markForm.score),
        maxScore: Number(markForm.maxScore),
        comments: markForm.comments,
      } as any);
      setMarks(prev => [created as unknown as AssessmentMark, ...prev]);
      setIsMarkFormOpen(false);
      setMarkForm({ title: '', score: '', maxScore: '', comments: '' });
    } catch (err) {
      console.error('Failed to save project mark', err);
    }
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const created = await createProjectMilestone(id, {
        description: milestoneForm.description,
        status: milestoneForm.status,
        date: milestoneForm.date,
      } as any);
      setMilestones(prev => [created as unknown as ProjectMilestone, ...prev]);
      setIsMilestoneFormOpen(false);
      setMilestoneForm({ description: '', status: 'On Track', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error('Failed to save milestone', err);
    }
  };

  if (loading || !project) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card><CardContent className="h-32 p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
      </div>
    );
  }

  const getStatusColor = (status: MilestoneStatus) => {
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    if (status === 'Delayed') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-800 text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            {project.name}
            <span className="text-xs font-mono font-normal px-2 py-1 bg-slate-100 dark:bg-brand-900/50 text-slate-600 dark:text-slate-400 rounded">
              {project.type}
            </span>
          </h1>
        </div>
      </div>

      {/* Project Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{project.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {project.techStack.map((tech: string) => (
                  <span key={tech} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Marks */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-500" /> Project Assessments
            </h3>
            <button onClick={() => setIsMarkFormOpen(!isMarkFormOpen)} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              {isMarkFormOpen ? 'Cancel' : '+ Log Assessment'}
            </button>
          </div>

          {isMarkFormOpen && (
            <Card className="border-emerald-200 dark:border-emerald-900/50">
              <CardContent className="p-4 sm:p-6 bg-emerald-50/30 dark:bg-emerald-900/10">
                <form onSubmit={handleMarkSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Assessment Title</label>
                      <input required type="text" value={markForm.title} onChange={e => setMarkForm({...markForm, title: e.target.value})} className="w-full p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Score</label>
                      <input required type="number" value={markForm.score} onChange={e => setMarkForm({...markForm, score: e.target.value})} className="w-full p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Max Score</label>
                      <input required type="number" value={markForm.maxScore} onChange={e => setMarkForm({...markForm, maxScore: e.target.value})} className="w-full p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Comments</label>
                    <textarea required value={markForm.comments} onChange={e => setMarkForm({...markForm, comments: e.target.value})} className="w-full h-20 p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-emerald-500 resize-none" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700">Save</button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {marks.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-200 dark:border-brand-800 rounded-lg">No assessments logged for this project.</p>
          ) : (
            <div className="space-y-3">
              {marks.map(mark => (
                <Card key={mark.id}>
                  <CardContent className="p-4 flex gap-4 justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{mark.assessmentTitle}</h4>
                      <p className="text-xs text-slate-500 mb-1">Evaluated by {mark.teacherName} on {new Date(mark.date).toLocaleDateString()}</p>
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

        {/* Project Milestones */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flag className="w-5 h-5 text-purple-500" /> Milestones
            </h3>
            <button onClick={() => setIsMilestoneFormOpen(!isMilestoneFormOpen)} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              {isMilestoneFormOpen ? 'Cancel' : '+ Add Milestone'}
            </button>
          </div>

          {isMilestoneFormOpen && (
            <Card className="border-purple-200 dark:border-purple-900/50">
              <CardContent className="p-4 sm:p-6 bg-purple-50/30 dark:bg-purple-900/10">
                <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Milestone Description</label>
                    <input required type="text" value={milestoneForm.description} onChange={e => setMilestoneForm({...milestoneForm, description: e.target.value})} className="w-full p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                      <select value={milestoneForm.status} onChange={e => setMilestoneForm({...milestoneForm, status: e.target.value as MilestoneStatus})} className="w-full p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-purple-500">
                        <option value="On Track">On Track</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                      <input required type="date" value={milestoneForm.date} onChange={e => setMilestoneForm({...milestoneForm, date: e.target.value})} className="w-full p-2 text-sm bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-md focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700">Save</button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {milestones.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-200 dark:border-brand-800 rounded-lg">No milestones logged.</p>
          ) : (
            <div className="space-y-3 relative pl-4 border-l-2 border-slate-100 dark:border-brand-800 ml-2">
              {milestones.map(milestone => (
                <div key={milestone.id} className="relative mb-6">
                  <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-brand-900 ${getStatusColor(milestone.status).split(' ')[0]}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(milestone.status)}`}>{milestone.status}</span>
                      <span className="text-xs text-slate-500">{new Date(milestone.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
