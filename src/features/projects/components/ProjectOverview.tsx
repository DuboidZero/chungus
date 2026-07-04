import { FolderGit2, Calendar, User, Layers, GitBranch } from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/card';
import type { Project } from '../../../api/entities/project';

interface Props {
  project: Project;
}

export function ProjectOverview({ project }: Props) {
  return (
    <Card className="border-outline-variant">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
            <FolderGit2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-on-surface">{project.name}</h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-primary font-medium">{project.domain}</p>
          </div>
        </div>

        <p className="text-sm text-on-surface-variant mb-6 whitespace-pre-wrap">
          {project.description}
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map(tech => (
                <span key={tech} className="text-xs px-2.5 py-1 bg-surface-container text-on-surface-variant rounded border border-outline-variant">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/40">
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Project Metadata</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-on-surface-variant/70" />
                <span>{project.type}</span>
              </div>
              {(project.startDate || project.endDate) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-on-surface-variant/70" />
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
                  <User className="w-4 h-4 text-on-surface-variant/70" />
                  <span>Mentor: {project.mentorName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/40">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-on-surface-variant/70" />
                <span className="text-sm font-medium text-on-surface-variant">GitHub Repository</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Coming Soon</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
