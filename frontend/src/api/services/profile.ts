/**
 * Profile service.
 * Wraps API calls for student profile endpoints.
 */

import { apiClient } from '../client';
import { API } from '../endpoints';
import type { ProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from '../contracts/profile';
import { USE_MOCK, mockDriver } from '../mock';

/** GET /me/profile */
export async function getProfile(targetUserId?: string): Promise<ProfileResponse> {
  if (USE_MOCK) {
    const userId = targetUserId || mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const data = mockDriver.getProfile(userId);
    if (!data) throw new Error("Profile not found for user");
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<ProfileResponse>(API.PROFILE);
  return response.data;
}

/** PATCH /me/profile */
export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.patch<UpdateProfileResponse>(API.PROFILE, data);
  return response.data;
}
