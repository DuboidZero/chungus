/**
 * Projects API contracts.
 * Request/Response DTOs for project CRUD endpoints.
 */

import type { Project, ProjectType, ProjectStatus } from '../entities/project';

/** GET /me/projects — Response */
export type ProjectListResponse = Project[];

/** GET /me/projects/:id — Response */
export type ProjectResponse = Project;

/** POST /me/projects — Request */
export interface CreateProjectRequest {
  name: string;
  description: string;
  domain: string;
  techStack: string[];
  imageUrl?: string;
  type: ProjectType;
  mentorName?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

/** POST /me/projects — Response */
export type CreateProjectResponse = Project;

/** PATCH /me/projects/:id — Request */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  domain?: string;
  techStack?: string[];
  imageUrl?: string;
  type?: ProjectType;
  mentorName?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

/** PATCH /me/projects/:id — Response */
export type UpdateProjectResponse = Project;

/** DELETE /me/projects/:id — Response (204 No Content) */
export type DeleteProjectResponse = void;
