import { FolderGit2, Calendar, User, Layers, GitBranch } from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/card';
import type { Project } from '../../../api/entities/project';

interface Props {
  project: Project;
}

export function ProjectOverview({ project }: Props) {
  return (
    <Card className="border-slate-200 dark:border-outline-variant">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary-fixed dark:bg-surface-container-low flex items-center justify-center shrink-0">
            <FolderGit2 className="w-6 h-6 text-primary dark:text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-primary dark:text-primary font-medium">{project.domain}</p>
          </div>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 mb-6 whitespace-pre-wrap">
          {project.description}
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map(tech => (
                <span key={tech} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-outline-variant">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Project Metadata</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>{project.type}</span>
              </div>
              {(project.startDate || project.endDate) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : '?'}
                    {' → '}
                    {project.status === 'Completed' && project.endDate
                      ? new Date(project.endDate).toLocaleDateString('default', { month: 'short', year: 'numeric' })
                      : 'Present'}
                  </span>
                </div>
              )}
              {project.mentorName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Mentor: {project.mentorName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-outline-variant">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">GitHub Repository</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Coming Soon</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
