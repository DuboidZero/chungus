/**
 * Teacher Portal API Contracts.
 * Operations for viewing and managing assigned students.
 */

import type { 
  StudentSummary, 
  PrivateNote, 
  AssessmentMark, 
  ProjectMilestone,
  GuidanceCaseStatus,
  GuidanceCase
} from '../entities/teacher';
import type { Profile } from '../entities/profile';

// ─── Student Listing ──────────────────────────────────────────────────

/** GET /teacher/students — Request Query Params */
export interface GetAssignedStudentsRequest {
  search?: string; // PRN or Name
  batch?: string;
  department?: string;
  performanceTier?: string;
  guidanceStatus?: string;
  skill?: string;
  domain?: string;
  supportNeeded?: string;
}

/** GET /teacher/students — Response */
export type GetAssignedStudentsResponse = StudentSummary[];

// ─── Student Detail View ──────────────────────────────────────────────

/** GET /teacher/students/:id/overview — Response */
export interface StudentOverviewResponse {
  profile: Profile;
  cgpa: number;
  cgpaTrend: { semester: string; cgpa: number }[];
  radarSkills: { domain: string; score: number }[];
  activeProjectsCount: number;
  totalAchievements: number;
}

// ─── Timeline ─────────────────────────────────────────────────────────

export type TimelineEventType = 'NOTE' | 'MARK' | 'PROJECT_MILESTONE' | 'SYSTEM_UPDATE' | 'ACHIEVEMENT' | 'SKILL_ADD' | 'GUIDANCE_CASE';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  title: string;
  description: string;
  author: string; // "System", "Student", or "Teacher Name"
  isTeacherInitiated: boolean;
  metadata?: Record<string, any>; // Extra context (e.g. score for marks)
}

/** GET /teacher/students/:id/timeline — Response */
export type StudentTimelineResponse = TimelineEvent[];

// ─── Notes ────────────────────────────────────────────────────────────

/** POST /teacher/students/:id/notes — Request */
export interface CreateNoteRequest {
  content: string;
}

/** POST /teacher/students/:id/notes — Response */
export type CreateNoteResponse = PrivateNote;

// ─── Assessments (General & Project-Level) ──────────────────────────

/** POST /teacher/students/:id/marks — Request */
export interface CreateStudentMarkRequest {
  assessmentTitle: string;
  score: number;
  maxScore: number;
  comments: string;
  date: string; // YYYY-MM-DD
}

/** POST /teacher/projects/:id/marks — Request */
export type CreateProjectMarkRequest = CreateStudentMarkRequest;

/** POST /teacher/.../marks — Response */
export type CreateMarkResponse = AssessmentMark;

// ─── Project Milestones ───────────────────────────────────────────────

/** POST /teacher/projects/:id/milestones — Request */
export interface CreateMilestoneRequest {
  description: string;
  status: import('../entities/teacher').MilestoneStatus;
  date: string; // YYYY-MM-DD
}

/** POST /teacher/projects/:id/milestones — Response */
export type CreateMilestoneResponse = ProjectMilestone;

// ─── Guidance Cases ───────────────────────────────────────────────────

/** PATCH /teacher/guidance-cases/:id — Request */
export interface UpdateGuidanceCaseRequest {
  status: GuidanceCaseStatus;
  resolutionNote?: string;
}

/** PATCH /teacher/guidance-cases/:id — Response */
export type UpdateGuidanceCaseResponse = GuidanceCase;
