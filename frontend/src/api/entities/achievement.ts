/**
 * Achievement entity.
 * Represents a competition, hackathon, award, certification, or publication.
 */

export type AchievementCategory = 'Academic' | 'Co-curricular' | 'Sports' | 'Technical' | 'Cultural' | 'Other';
export type AchievementType = 'Competition' | 'Hackathon' | 'Award' | 'Certification' | 'Publication' | 'Other';
export type AchievementLevel = 'College' | 'State' | 'National' | 'International';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  level: AchievementLevel;
  date: string;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
}
