/**
 * Work experience API contracts.
 * Request/Response DTOs for experience CRUD endpoints.
 */

import type { Experience, ExperienceType } from '../entities/experience';

/** GET /me/experience — Response */
export type ExperienceListResponse = Experience[];

/** GET /me/experience/:id — Response */
export type ExperienceResponse = Experience;

/** POST /me/experience — Request */
export interface CreateExperienceRequest {
  organisationName: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  type: ExperienceType;
}

/** POST /me/experience — Response */
export type CreateExperienceResponse = Experience;

/** PATCH /me/experience/:id — Request */
export interface UpdateExperienceRequest {
  organisationName?: string;
  role?: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
  type?: ExperienceType;
}

/** PATCH /me/experience/:id — Response */
export type UpdateExperienceResponse = Experience;

/** DELETE /me/experience/:id — Response (204 No Content) */
export type DeleteExperienceResponse = void;
