import { GitBranch, Calendar, User, Edit2, Trash2, Layers } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import type { ProjectEntry } from './types';

interface Props {
  project: ProjectEntry;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: Props) {
  return (
    <Card className="overflow-hidden flex flex-col group h-full">
      {/* Project Image Placeholder */}
      <div className="h-48 bg-surface-container relative overflow-hidden">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-on-surface-variant/70 font-medium">No Image Uploaded</span>
          </div>
        )}
        
        {/* Hover Actions */}
        {/* Hover Actions — only when edit/delete handlers are provided (i.e. the owner's view, not the teacher's read-only view) */}
        {(onEdit || onDelete) && (
          <div className="absolute inset-0 bg-inverse-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            {onEdit && (
              <button onClick={onEdit} className="p-2 bg-white text-on-surface rounded-full hover:bg-surface-container-low hover:text-primary transition-colors shadow-lg">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-2 bg-white text-on-surface rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-on-surface line-clamp-1">{project.name}</h3>
            <p className="text-sm text-primary font-medium">{project.domain}</p>
          </div>
          <Badge variant={project.status === 'Completed' ? 'success' : 'warning'}>
            {project.status}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-on-surface-variant line-clamp-3 mb-4">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.techStack.map(tech => (
            <span key={tech} className="px-2 py-0.5 text-xs font-medium bg-surface-container text-on-surface-variant rounded">
              {tech}
            </span>
          ))}
        </div>

        {/* Spacer to push metadata down */}
        <div className="mt-auto pt-4 border-t border-outline-variant/40 space-y-3">
          {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{project.type}</span>
            </div>
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {project.startDate ? new Date(project.startDate + '-01').toLocaleDateString('default', { month: 'short', year: 'numeric' }) : '?'}
                  {' → '}
                  {project.status === 'Completed' && project.endDate
                    ? new Date(project.endDate + '-01').toLocaleDateString('default', { month: 'short', year: 'numeric' })
                    : 'Present'}
                </span>
              </div>
            )}
            {project.mentorName && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Mentor: {project.mentorName}</span>
              </div>
            )}
          </div>

          {/* GitHub Integration Placeholder */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-on-surface-variant/70" />
              <span className="text-xs font-medium text-on-surface-variant">GitHub Integration</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">Coming Phase 2</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
