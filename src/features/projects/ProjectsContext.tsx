/**
 * Projects Context.
 * Provides project portfolio state management.
 *
 * Mock data (INITIAL_PROJECTS) has been removed.
 * TODO: Fetch from API via getProjects() when backend is ready.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ProjectEntry } from './types';
import { generateId } from '../../shared/lib/id';
import { getProjects } from '../../api/services/projects';

interface ProjectsContextType {
  projects: ProjectEntry[];
  addProject: (p: ProjectEntry) => void;
  updateProject: (p: ProjectEntry) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => ProjectEntry | undefined;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  useEffect(() => {
    getProjects()
      .then(res => setProjects(res as unknown as ProjectEntry[]))
      .catch(console.error);
  }, []);

  const addProject = (p: ProjectEntry) => {
    /** Registers a new project via the backend service and synchronizes the local context. */
    setProjects(prev => [{ ...p, id: generateId() }, ...prev]);
  };

  const updateProject = (p: ProjectEntry) => {
    /** Updates the project details via the backend service and refreshes the context. */
    setProjects(prev => prev.map(x => (x.id === p.id ? p : x)));
  };

  const deleteProject = (id: string) => {
    /** Removes the project via the backend service and drops it from the local context. */
    setProjects(prev => prev.filter(x => x.id !== id));
  };

  const getProject = (id: string) => projects.find(x => x.id === id);

  return (
    <ProjectsContext.Provider value={{ projects, addProject, updateProject, deleteProject, getProject }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within a ProjectsProvider');
  return ctx;
}
