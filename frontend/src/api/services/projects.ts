/**
 * Projects service.
 * Wraps API calls for project CRUD endpoints.
 */

import { apiClient } from '../client';
import { API } from '../endpoints';
import type {
  ProjectListResponse,
  ProjectResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
} from '../contracts/projects';
import { USE_MOCK, mockDriver } from '../mock';

/** GET /me/projects */
export async function getProjects(): Promise<ProjectListResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const data = mockDriver.getProjects(userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<ProjectListResponse>(API.PROJECTS);
  return response.data;
}

/** GET /me/projects/:id */
export async function getProject(id: string): Promise<ProjectResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const data = mockDriver.getProjects(userId);
    const proj = data.find((p: any) => p.id === id);
    if (!proj) throw new Error("Project not found");
    await new Promise(resolve => setTimeout(resolve, 500));
    return proj;
  }
  const response = await apiClient.get<ProjectResponse>(API.PROJECT(id));
  return response.data;
}

/** POST /me/projects */
export async function createProject(data: CreateProjectRequest): Promise<CreateProjectResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const created = mockDriver.createProject(userId, data);
    await new Promise(resolve => setTimeout(resolve, 400));
    return created;
  }
  const response = await apiClient.post<CreateProjectResponse>(API.PROJECTS, data);
  return response.data;
}

/** PATCH /me/projects/:id */
export async function updateProject(id: string, data: UpdateProjectRequest): Promise<UpdateProjectResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const updated = mockDriver.updateProject(userId, id, data);
    await new Promise(resolve => setTimeout(resolve, 400));
    return updated;
  }
  const response = await apiClient.patch<UpdateProjectResponse>(API.PROJECT(id), data);
  return response.data;
}

/** DELETE /me/projects/:id */
export async function deleteProject(id: string): Promise<void> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    mockDriver.deleteProject(userId, id);
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }
  await apiClient.delete(API.PROJECT(id));
}

/** PATCH /me/projects/:id/feature — toggle is_featured (max 3 at a time) */
export async function toggleFeaturedProject(id: string): Promise<{ isFeatured: boolean }> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const result = mockDriver.toggleFeatured(userId, id);
    await new Promise(resolve => setTimeout(resolve, 200));
    return { isFeatured: result.isFeatured };
  }
  const response = await apiClient.patch<{ isFeatured: boolean }>(API.PROJECT_FEATURE(id), {});
  return response.data;
}
