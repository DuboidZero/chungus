/**
 * Project entity.
 * Represents a portfolio project owned by a student.
 */

export type ProjectType = 'College Project' | 'Personal Project' | 'Internship Project';
export type ProjectStatus = 'Ongoing' | 'Completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  domain: string;
  techStack: string[];
  imageUrl?: string;
  type: ProjectType;
  mentorName?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  /** Phase 2: Optional GitHub integration metadata */
  githubRepo?: {
    name: string;
    url: string;
    stars: number;
    forks: number;
    commits: number;
    language: string;
    lastUpdated: string;
  };
  createdAt: string;
  updatedAt: string;
}
