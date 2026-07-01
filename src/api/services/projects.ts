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
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.post<CreateProjectResponse>(API.PROJECTS, data);
  return response.data;
}

/** PATCH /me/projects/:id */
export async function updateProject(id: string, data: UpdateProjectRequest): Promise<UpdateProjectResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.patch<UpdateProjectResponse>(API.PROJECT(id), data);
  return response.data;
}

/** DELETE /me/projects/:id */
export async function deleteProject(id: string): Promise<void> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  await apiClient.delete(API.PROJECT(id));
}
