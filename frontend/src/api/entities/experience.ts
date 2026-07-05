/**
 * Work experience entity.
 * Represents an internship, part-time, or full-time professional role.
 */

export type ExperienceType = 'Internship' | 'Part-time' | 'Full-time';

export interface Experience {
  id: string;
  organisationName: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  type: ExperienceType;
  createdAt: string;
  updatedAt: string;
}
