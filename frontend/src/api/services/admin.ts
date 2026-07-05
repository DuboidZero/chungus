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

// Bulk Upload Services — real backend calls
async function postImport(url: string, file: File): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const { created = 0, skipped = 0, errors = [] } = response.data || {};
  const errorMsg = errors.length ? ` ${errors.length} row(s) had errors.` : '';
  return {
    success: true,
    message: `Imported ${created} row(s). ${skipped} skipped.${errorMsg}`,
  };
}

export async function uploadStudents(file: File): Promise<{ success: boolean; message: string }> {
  return postImport(API.ADMIN.IMPORT_STUDENTS, file);
}

export async function uploadMarks(file: File): Promise<{ success: boolean; message: string }> {
  return postImport(API.ADMIN.IMPORT_MARKS, file);
}

export async function uploadSkills(file: File): Promise<{ success: boolean; message: string }> {
  return postImport(API.ADMIN.IMPORT_SKILLS, file);
}

export async function uploadProjects(file: File): Promise<{ success: boolean; message: string }> {
  return postImport(API.ADMIN.IMPORT_PROJECTS, file);
}

export async function uploadAchievements(file: File): Promise<{ success: boolean; message: string }> {
  return postImport(API.ADMIN.IMPORT_ACHIEVEMENTS, file);
}

export async function uploadWorkExperience(file: File): Promise<{ success: boolean; message: string }> {
  return postImport(API.ADMIN.IMPORT_WORK_EXPERIENCE, file);
}