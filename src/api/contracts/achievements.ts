/**
 * Achievements API contracts.
 * Request/Response DTOs for achievement CRUD endpoints.
 */

import type { Achievement, AchievementCategory, AchievementType, AchievementLevel } from '../entities/achievement';

/** GET /me/achievements — Response */
export type AchievementListResponse = Achievement[];

/** GET /me/achievements/:id — Response */
export type AchievementResponse = Achievement;

/** POST /me/achievements — Request */
export interface CreateAchievementRequest {
  title: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  level: AchievementLevel;
  date: string;
  certificateUrl?: string;
}

/** POST /me/achievements — Response */
export type CreateAchievementResponse = Achievement;

/** PATCH /me/achievements/:id — Request */
export interface UpdateAchievementRequest {
  title?: string;
  description?: string;
  category?: AchievementCategory;
  type?: AchievementType;
  level?: AchievementLevel;
  date?: string;
  certificateUrl?: string;
}

/** PATCH /me/achievements/:id — Response */
export type UpdateAchievementResponse = Achievement;

/** DELETE /me/achievements/:id — Response (204 No Content) */
export type DeleteAchievementResponse = void;
