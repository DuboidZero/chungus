/**
 * Academic records service.
 * Wraps API calls for semester CRUD endpoints.
 */

import { apiClient } from '../client';
import { API } from '../endpoints';
import type {
  AcademicRecordsResponse,
  CreateSemesterRequest,
  CreateSemesterResponse,
  UpdateSemesterRequest,
  UpdateSemesterResponse,
} from '../contracts/academic';
import { USE_MOCK, mockDriver } from '../mock';

/** GET /me/academic-records */
export async function getAcademicRecords(): Promise<AcademicRecordsResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const data = mockDriver.getAcademicRecords(userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<AcademicRecordsResponse>(API.ACADEMIC_RECORDS);
  return response.data;
}

/** POST /me/academic-records */
export async function createSemester(data: CreateSemesterRequest): Promise<CreateSemesterResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.post<CreateSemesterResponse>(API.ACADEMIC_RECORDS, data);
  return response.data;
}

/** PATCH /me/academic-records/:id */
export async function updateSemester(id: string, data: UpdateSemesterRequest): Promise<UpdateSemesterResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.patch<UpdateSemesterResponse>(API.ACADEMIC_RECORD(id), data);
  return response.data;
}

/** DELETE /me/academic-records/:id */
export async function deleteSemester(id: string): Promise<void> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  await apiClient.delete(API.ACADEMIC_RECORD(id));
}
