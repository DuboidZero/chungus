/**
 * Work experience service.
 * Wraps API calls for experience CRUD endpoints.
 */

import { apiClient } from '../client';
import { API } from '../endpoints';
import type {
  ExperienceListResponse,
  CreateExperienceRequest,
  CreateExperienceResponse,
  UpdateExperienceRequest,
  UpdateExperienceResponse,
} from '../contracts/experience';
import { USE_MOCK, mockDriver } from '../mock';

/** GET /me/experience */
export async function getExperience(): Promise<ExperienceListResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const data = mockDriver.getExperience(userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<ExperienceListResponse>(API.EXPERIENCE);
  return response.data;
}

/** POST /me/experience */
export async function createExperience(data: CreateExperienceRequest): Promise<CreateExperienceResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.post<CreateExperienceResponse>(API.EXPERIENCE, data);
  return response.data;
}

/** PATCH /me/experience/:id */
export async function updateExperience(id: string, data: UpdateExperienceRequest): Promise<UpdateExperienceResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.patch<UpdateExperienceResponse>(API.EXPERIENCE_ITEM(id), data);
  return response.data;
}

/** DELETE /me/experience/:id */
export async function deleteExperience(id: string): Promise<void> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  await apiClient.delete(API.EXPERIENCE_ITEM(id));
}
