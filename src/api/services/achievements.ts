/**
 * Achievements service.
 * Wraps API calls for achievement CRUD endpoints.
 * TODO: Implement when backend is ready.
 */

import { apiClient } from '../client';
import { API } from '../endpoints';
import type {
  AchievementListResponse,
  CreateAchievementRequest,
  CreateAchievementResponse,
  UpdateAchievementRequest,
  UpdateAchievementResponse,
} from '../contracts/achievements';
import { USE_MOCK, mockDriver } from '../mock';

/** GET /me/achievements */
export async function getAchievements(): Promise<AchievementListResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const data = mockDriver.getAchievements(userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<AchievementListResponse>(API.ACHIEVEMENTS);
  return response.data;
}

/** POST /me/achievements */
export async function createAchievement(data: CreateAchievementRequest): Promise<CreateAchievementResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.post<CreateAchievementResponse>(API.ACHIEVEMENTS, data);
  return response.data;
}

/** PATCH /me/achievements/:id */
export async function updateAchievement(id: string, data: UpdateAchievementRequest): Promise<UpdateAchievementResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.patch<UpdateAchievementResponse>(API.ACHIEVEMENT_ITEM(id), data);
  return response.data;
}

/** DELETE /me/achievements/:id */
export async function deleteAchievement(id: string): Promise<void> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  await apiClient.delete(API.ACHIEVEMENT_ITEM(id));
}
