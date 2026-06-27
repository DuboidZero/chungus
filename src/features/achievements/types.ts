export type AchievementCategory = 'Academic' | 'Co-curricular' | 'Sports' | 'Technical' | 'Cultural' | 'Other';
export type AchievementType = 'Competition' | 'Hackathon' | 'Award' | 'Certification' | 'Publication' | 'Other';
export type AchievementLevel = 'College' | 'State' | 'National' | 'International';

export interface AchievementEntry {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  level: AchievementLevel;
  date: string; // e.g. "2024-03-15"
  certificateUrl?: string; // Phase 2 / not MVP
}
