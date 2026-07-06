/**
 * Project types — re-exported from the canonical API entity.
 * Includes local form-state type that omits server-generated fields.
 */

export type { Project, ProjectType, ProjectStatus } from '../../api/entities/project';

/**
 * Local form state for project creation/editing.
 * Omits server-generated fields (createdAt, updatedAt).
 * Used by ProjectForm and ProjectsContext for local state management.
 */
export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  domain: string;
  techStack: string[];
  imageUrl?: string;
  type: 'College Project' | 'Personal Project' | 'Internship Project';
  mentorId?: string | null;
  mentorName?: string | null;
  status: 'Ongoing' | 'Completed';
  startDate?: string;
  endDate?: string;
  githubRepo?: {
    name: string;
    url: string;
    stars: number;
    forks: number;
    commits: number;
    language: string;
    lastUpdated: string;
  };
  isFeatured?: boolean;
}
