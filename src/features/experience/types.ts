export type ExperienceType = 'Internship' | 'Part-time' | 'Full-time';

export interface WorkExperienceEntry {
  id: string;
  organisationName: string;
  role: string;
  startDate: string; // e.g. "2023-06"
  endDate?: string;  // e.g. "2023-08", or undefined if "Present"
  description: string;
  type: ExperienceType;
}
