/**
 * Admin API Contracts.
 */
import type { Cohort } from '../entities/cohort';

export type GetCohortsResponse = Cohort[];

export interface UpdateCohortRequest {
  academicMentorId: string | null;
}

export type UpdateCohortResponse = Cohort;
