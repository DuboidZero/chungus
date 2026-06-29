/**
 * Achievement types — re-exported from the canonical API entity.
 */

export type { Achievement, AchievementCategory, AchievementType, AchievementLevel } from '../../api/entities/achievement';

/**
 * Local form state for achievement records.
 * Omits server-generated fields (createdAt, updatedAt).
 */
export interface AchievementEntry {
  id: string;
  title: string;
  description: string;
  category: import('../../api/entities/achievement').AchievementCategory;
  type: import('../../api/entities/achievement').AchievementType;
  level: import('../../api/entities/achievement').AchievementLevel;
  date: string; // e.g. "2024-03-15"
  certificateUrl?: string; // Phase 2 / not MVP
}
