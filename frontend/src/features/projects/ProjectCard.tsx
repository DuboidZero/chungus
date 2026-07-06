import { useState, useContext } from 'react';
import { GitBranch, Calendar, User, Edit2, Trash2, Layers, Star } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import type { ProjectEntry } from './types';
import { ProjectsContext } from './ProjectsContext';

interface Props {
  project: ProjectEntry;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  /** When true the star toggle is hidden (e.g. teacher's read-only view). */
  readOnly?: boolean;
}

export function ProjectCard({ project, onEdit, onDelete, readOnly }: Props) {
  // ProjectsContext may not be present in teacher read-only views — handle gracefully
  const ctx = useContext(ProjectsContext);
  const canStar = !readOnly && ctx !== undefined;
  const [starring, setStarring] = useState(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (starring || !ctx) return;
    setFeaturedError(null);
    setStarring(true);
    try {
      await ctx.toggleFeatured(project.id);
    } catch (err: any) {
      setFeaturedError(err?.message ?? 'Could not update featured status.');
      setTimeout(() => setFeaturedError(null), 3500);
    } finally {
      setStarring(false);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col group h-full">
      {/* Project Image / Banner */}
      <div className="h-48 bg-surface-container relative overflow-hidden">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-on-surface-variant/70 font-medium">No Image Uploaded</span>
          </div>
        )}

        {/* Star / Feature button — top-right corner */}
        {canStar && (
          <button
            onClick={handleStar}
            disabled={starring}
            title={project.isFeatured ? 'Unfeature this project' : 'Feature this project on recruiter profile'}
            className={`absolute top-3 right-3 z-20 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 shadow-md
              ${starring ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              ${project.isFeatured
                ? 'bg-amber-400/90 text-white hover:bg-amber-500'
                : 'bg-white/80 text-on-surface-variant/50 hover:text-amber-400 hover:bg-white'
              }`}
          >
            <Star
              className="w-4 h-4 transition-transform duration-150 hover:scale-110"
              fill={project.isFeatured ? 'currentColor' : 'none'}
            />
          </button>
        )}

        {/* Error toast */}
        {featuredError && (
          <div className="absolute bottom-2 left-2 right-2 z-30 bg-red-600 text-white text-xs rounded-lg px-3 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-1">
            {featuredError}
          </div>
        )}

        {/* Hover Actions (edit/delete) */}
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
          <div className="min-w-0 flex-1 mr-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-on-surface line-clamp-1">{project.name}</h3>
              {project.isFeatured && (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" fill="currentColor" /> Featured
                </span>
              )}
            </div>
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

        {/* Metadata footer */}
        <div className="mt-auto pt-4 border-t border-outline-variant/40 space-y-3">
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
