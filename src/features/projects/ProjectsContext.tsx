import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ProjectEntry } from './types';
import { generateId } from '../../shared/lib/id';

const INITIAL_PROJECTS: ProjectEntry[] = [
  {
    id: 'p1',
    name: 'Polytechnic Portfolio System',
    description: 'A comprehensive web application for students to track their academic and professional progress, built specifically for MIT WPU.',
    domain: 'Web Development',
    techStack: ['React', 'TypeScript', 'TailwindCSS'],
    type: 'College Project',
    mentorName: 'Prof. Chungus',
    status: 'Ongoing',
    startDate: '2024-01',
  },
  {
    id: 'p2',
    name: 'Smart IoT Home Monitor',
    description: 'Hardware and software solution to monitor temperature, humidity, and security using Raspberry Pi and external sensors.',
    domain: 'IoT',
    techStack: ['Python', 'Raspberry Pi', 'MQTT'],
    type: 'Personal Project',
    status: 'Completed',
    startDate: '2023-06',
    endDate: '2023-12',
  },
];

interface ProjectsContextType {
  projects: ProjectEntry[];
  addProject: (p: ProjectEntry) => void;
  updateProject: (p: ProjectEntry) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => ProjectEntry | undefined;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectEntry[]>(INITIAL_PROJECTS);

  const addProject = (p: ProjectEntry) => {
    setProjects(prev => [{ ...p, id: generateId() }, ...prev]);
  };

  const updateProject = (p: ProjectEntry) => {
    setProjects(prev => prev.map(x => (x.id === p.id ? p : x)));
  };

  const deleteProject = (id: string) => {
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
