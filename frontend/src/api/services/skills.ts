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
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const created = mockDriver.createSkill(userId, 'technical', data);
    await new Promise(resolve => setTimeout(resolve, 400));
    return created;
  }
  const response = await apiClient.post<CreateTechnicalSkillResponse>(API.SKILLS_TECHNICAL, data);
  return response.data;
}

/** POST /me/skills/soft */
export async function createSoftSkill(data: CreateSoftSkillRequest): Promise<CreateSoftSkillResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const created = mockDriver.createSkill(userId, 'soft', data);
    await new Promise(resolve => setTimeout(resolve, 400));
    return created;
  }
  const response = await apiClient.post<CreateSoftSkillResponse>(API.SKILLS_SOFT, data);
  return response.data;
}

/** POST /me/skills/languages */
export async function createLanguageSkill(data: CreateLanguageSkillRequest): Promise<CreateLanguageSkillResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const created = mockDriver.createSkill(userId, 'languages', data);
    await new Promise(resolve => setTimeout(resolve, 400));
    return created;
  }
  const response = await apiClient.post<CreateLanguageSkillResponse>(API.SKILLS_LANGUAGES, data);
  return response.data;
}

/** DELETE /me/skills/:type/:id */
export async function deleteSkill(type: string, id: string): Promise<void> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const kind = (type === 'technical' || type === 'soft') ? type : 'languages';
    mockDriver.deleteSkill(userId, kind, id);
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }
  await apiClient.delete(API.SKILL(type, id));
}
