/**
 * Projects Context.
 * Provides project portfolio state management.
 *
 * Mock data (INITIAL_PROJECTS) has been removed.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ProjectEntry } from './types';
import {
  getProjects,
  createProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
  toggleFeaturedProject,
} from '../../api/services/projects';

interface ProjectsContextType {
  projects: ProjectEntry[];
  addProject: (p: ProjectEntry) => Promise<void>;
  updateProject: (p: ProjectEntry) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => ProjectEntry | undefined;
  toggleFeatured: (id: string) => Promise<void>;
}

export const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  useEffect(() => {
    getProjects()
      .then(res => setProjects(res as unknown as ProjectEntry[]))
      .catch(console.error);
  }, []);

  const addProject = async (p: ProjectEntry) => {
    const created = await createProject(p as any);
    setProjects(prev => [created as unknown as ProjectEntry, ...prev]);
  };

  const updateProject = async (p: ProjectEntry) => {
    const saved = await apiUpdateProject(p.id, p as any);
    setProjects(prev => prev.map(x => (x.id === p.id ? (saved as unknown as ProjectEntry) : x)));
  };

  const deleteProject = async (id: string) => {
    await apiDeleteProject(id);
    setProjects(prev => prev.filter(x => x.id !== id));
  };

  const getProject = (id: string) => projects.find(x => x.id === id);

  const toggleFeatured = async (id: string) => {
    const result = await toggleFeaturedProject(id);
    setProjects(prev =>
      prev.map(x => (x.id === id ? { ...x, isFeatured: result.isFeatured } : x)),
    );
  };

  return (
    <ProjectsContext.Provider value={{ projects, addProject, updateProject, deleteProject, getProject, toggleFeatured }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within a ProjectsProvider');
  return ctx;
}