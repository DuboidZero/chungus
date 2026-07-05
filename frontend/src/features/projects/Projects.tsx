import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from './ProjectCard';
import { DeleteConfirmModal, Modal } from '../../shared/ui/modal';
import { ProjectForm } from './ProjectForm';
import { useProjects } from './ProjectsContext';
import { useState } from 'react';

export function Projects() {
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  // null = closed; '' = add new; id = edit that project
  const [formFor, setFormFor] = useState<string | null>(null);

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
          <h1 className="text-3xl font-bold text-on-surface">Project Portfolio</h1>
          <p className="text-on-surface-variant mt-1">
            Showcase your technical projects and implementations.
          </p>
        </div>
        <button
          onClick={() => setFormFor('')}
          className="press flex items-center gap-2 px-4 py-2 bg-primary-container hover:bg-primary text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer">
              <ProjectCard
                project={project}
                onEdit={(e) => { e.stopPropagation(); setFormFor(project.id); }}
                onDelete={(e) => { e.stopPropagation(); setDeleting({ id: project.id, name: project.name }); }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-outline-variant">
          <p className="text-on-surface-variant font-medium">No projects yet.</p>
          <p className="text-sm text-on-surface-variant/70 mt-1">Click "Add Project" to start building your portfolio.</p>
        </div>
      )}

      {/* Add / Edit project popup */}
      <Modal
        isOpen={formFor !== null}
        onClose={() => setFormFor(null)}
        title={formFor ? 'Edit Project' : 'Add New Project'}
        maxWidth="2xl"
      >
        <ProjectForm
          embedded
          projectId={formFor || undefined}
          onDone={() => setFormFor(null)}
        />
      </Modal>

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
