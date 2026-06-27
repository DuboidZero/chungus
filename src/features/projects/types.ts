export type ProjectType = 'College Project' | 'Personal Project' | 'Internship Project';
export type ProjectStatus = 'Ongoing' | 'Completed';

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  domain: string;
  techStack: string[];
  imageUrl?: string;
  type: ProjectType;
  mentorName?: string; /** Required only when type is 'College Project' */
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
}
