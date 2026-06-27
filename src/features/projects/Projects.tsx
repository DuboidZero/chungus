import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from './ProjectCard';
import { DeleteConfirmModal } from '../../shared/ui/modal';
import { useProjects } from './ProjectsContext';
import { useState } from 'react';

export function Projects() {
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = () => {
    if (deleting) {
      deleteProject(deleting.id);
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Project Portfolio</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Showcase your technical projects and implementations.
          </p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => navigate(`/projects/${project.id}/edit`)}
              onDelete={() => setDeleting({ id: project.id, name: project.name })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-brand-900 rounded-xl border border-dashed border-slate-300 dark:border-brand-700">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No projects yet.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Click "Add Project" to start building your portfolio.</p>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        entityName={deleting?.name || ''}
      />
    </div>
  );
}
