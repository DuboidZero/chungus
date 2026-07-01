/**
 * Admin service.
 */
import { apiClient } from '../client';
import { API } from '../endpoints';
import { USE_MOCK, mockDriver } from '../mock';
import type { GetCohortsResponse, UpdateCohortRequest, UpdateCohortResponse } from '../contracts/admin';

export async function getCohorts(): Promise<GetCohortsResponse> {
  if (USE_MOCK) {
    const data = mockDriver.getAllCohorts();
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get(API.ADMIN.COHORTS);
  return response.data;
}

export async function updateCohortMentor(id: string, data: UpdateCohortRequest): Promise<UpdateCohortResponse> {
  if (USE_MOCK) {
    const result = mockDriver.updateCohortMentor(id, data.academicMentorId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return result;
  }
  const response = await apiClient.patch(API.ADMIN.COHORT(id), data);
  return response.data;
}

// Bulk Upload Mock Services
export async function uploadStudents(file: File): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: `Successfully imported students from ${file.name}` };
}

export async function uploadMarks(file: File): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: `Successfully imported marks from ${file.name}` };
}

export async function uploadSkills(file: File): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: `Successfully imported skills from ${file.name}` };
}

export async function uploadProjects(file: File): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: `Successfully imported projects from ${file.name}` };
}

export async function uploadAchievements(file: File): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: `Successfully imported achievements from ${file.name}` };
}

export async function uploadWorkExperience(file: File): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: `Successfully imported work experience from ${file.name}` };
}
