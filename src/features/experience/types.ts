/**
 * Work experience types — re-exported from the canonical API entity.
 */

export type { Experience, ExperienceType } from '../../api/entities/experience';

/**
 * Local form state for experience records.
 * Omits server-generated fields (createdAt, updatedAt).
 */
export interface WorkExperienceEntry {
  id: string;
  organisationName: string;
  role: string;
  startDate: string; // e.g. "2023-06-01"
  endDate?: string;  // e.g. "2023-08-31", or undefined if "Present"
  description: string;
  type: import('../../api/entities/experience').ExperienceType;
}
