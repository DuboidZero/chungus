/**
 * Dashboard API contracts.
 * Aggregation DTOs — these are NOT entities.
 * Shaped to match exactly what each dashboard view renders.
 */

import type { Deadline } from '../entities/deadline';
import type { GuidanceCase, SupportSignal } from '../entities/teacher';

// ─── Student Dashboard ──────────────────────────────────────────────

export interface StudentDashboardStats {
  cgpa: number;
  percentage: number;
  totalCredits: number;
  projectCount: number;
  achievementCount: number;
  skillCount: number;
}

export interface CgpaTrendPoint {
  semester: string;
  cgpa: number | null;
  projected: number | null;
}

export interface StudentDashboardResponse {
  stats: StudentDashboardStats;
  cgpaTrend: CgpaTrendPoint[];
  upcomingDeadlines: Deadline[];
}

// ─── Teacher Dashboard ───────────────────────────────────────────────

export interface TeacherDashboardStats {
  totalAssignedStudents: number;
  highPerformingCount: number;
  midTierCount: number;
  underperformingCount: number;
  activeGuidanceCases: number;
}

export interface CgpaDistributionBucket {
  range: string;
  count: number;
}

export interface SkillHeatmapData {
  domain: string;
  skills: {
    name: string;
    avgProficiency: number; // 1-5 scale
    studentCount: number;
  }[];
}

export interface DomainInterestData {
  domain: string;
  studentCount: number;
}

export interface TeacherDashboardResponse {
  stats: TeacherDashboardStats;
  supportNeeded: SupportSignal[]; // The urgent panel
  guidanceCases: GuidanceCase[];  // Case management panel
  // Charts
  cgpaDistribution: CgpaDistributionBucket[];
  gpaTrend: CgpaTrendPoint[];
  skillHeatmap: SkillHeatmapData[];
  domainInterests: DomainInterestData[];
}

// ─── Admin Dashboard ─────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeCohorts: number;
  avgCompletion: number;
}

export interface EnrollmentTrendPoint {
  month: string;
  students: number;
}

export interface CohortOverview {
  id: string;
  name: string;
  students: number;
  avgCgpa: number;
  completionPercentage: number;
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  enrollmentTrend: EnrollmentTrendPoint[];
  cohorts: CohortOverview[];
}
