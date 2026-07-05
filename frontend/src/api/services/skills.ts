/**
 * Skills service.
 * Wraps API calls for skills CRUD endpoints.
 */

import { apiClient } from '../client';
import { API } from '../endpoints';
import type {
  SkillsResponse,
  CreateTechnicalSkillRequest,
  CreateTechnicalSkillResponse,
  CreateSoftSkillRequest,
  CreateSoftSkillResponse,
  CreateLanguageSkillRequest,
  CreateLanguageSkillResponse,
} from '../contracts/skills';
import { USE_MOCK, mockDriver } from '../mock';

/** GET /me/skills */
export async function getSkills(): Promise<SkillsResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const data = mockDriver.getSkills(userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<SkillsResponse>(API.SKILLS);
  return response.data;
}

/** POST /me/skills/technical */
export async function createTechnicalSkill(data: CreateTechnicalSkillRequest): Promise<CreateTechnicalSkillResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.post<CreateTechnicalSkillResponse>(API.SKILLS_TECHNICAL, data);
  return response.data;
}

/** POST /me/skills/soft */
export async function createSoftSkill(data: CreateSoftSkillRequest): Promise<CreateSoftSkillResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.post<CreateSoftSkillResponse>(API.SKILLS_SOFT, data);
  return response.data;
}

/** POST /me/skills/languages */
export async function createLanguageSkill(data: CreateLanguageSkillRequest): Promise<CreateLanguageSkillResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.post<CreateLanguageSkillResponse>(API.SKILLS_LANGUAGES, data);
  return response.data;
}

/** DELETE /me/skills/:type/:id */
export async function deleteSkill(type: string, id: string): Promise<void> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  await apiClient.delete(API.SKILL(type, id));
}
