import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentProjects } from '../../../api/services/teacher';
import type { Project } from '../../../api/entities/project';
import { ProjectCard } from '../../projects/ProjectCard';

interface Props {
  studentId: string;
}

export function ProjectsTab({ studentId }: Props) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentProjects(studentId)
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return <div className="text-center py-12 text-slate-500 animate-pulse">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-surface-container-lowest rounded-xl border border-dashed border-slate-300 dark:border-outline-variant">
        <p className="text-slate-500 dark:text-slate-400 font-medium">No projects found.</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">This student hasn't uploaded any projects yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(project => (
          <div 
            key={project.id} 
            onClick={() => navigate(`/students/${studentId}/projects/${project.id}`)}
            className="cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg rounded-xl h-full"
          >
            {/* We don't pass onEdit or onDelete because teachers can't edit/delete student projects */}
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}
