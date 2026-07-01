/**
 * Teacher Portal specific entities.
 */

export type GuidanceCaseStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
export type PerformanceTier = 'High Performing' | 'Average - Guidable' | 'Underperforming';

/** 
 * Lightweight student entity for listings. 
 * Prevents fetching heavy portfolios for dashboard tables.
 */
export interface StudentSummary {
  id: string;
  prn: string;
  name: string;
  cgpa: number;
  performanceTier: PerformanceTier;
  guidanceStatus: GuidanceCaseStatus | null;
  lastInteractionDate: string | null;
  avatar?: string | null;
}

export interface PrivateNote {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentMark {
  id: string;
  studentId: string;
  projectId?: string | null; // null = general mark, string = project-level mark
  assessmentTitle: string;
  score: number;
  maxScore: number;
  comments: string;
  teacherId: string;
  teacherName: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type MilestoneStatus = 'On Track' | 'Delayed' | 'Completed';

export interface ProjectMilestone {
  id: string;
  projectId: string;
  description: string;
  status: MilestoneStatus;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuidanceCase {
  id: string;
  studentId: string;
  studentName: string;
  studentPrn: string;
  studentCgpa: number;
  triggerSignal: string; // e.g., 'CGPA < 6.0', 'No interaction in 30 days'
  owningTeacherId: string;
  owningTeacherName: string;
  status: GuidanceCaseStatus;
  resolutionNote?: string;
  dateOpened: string;
  dateResolved?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportSignal {
  id: string;
  studentId: string;
  studentName: string;
  studentPrn: string;
  studentCgpa: number;
  urgencyLabel: string; // e.g., "Critical", "Warning"
  reasonTags: string[]; // e.g., ["CGPA Declining", "No Recent Interaction"]
  isActiveSupport: boolean;
  createdAt: string;
}
