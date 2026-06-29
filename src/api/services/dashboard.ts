/**
 * Dashboard service.
 * Wraps API calls for dashboard data aggregation endpoints.
 * TODO: Implement when backend is ready.
 */

import { apiClient } from '../client';
import { API } from '../endpoints';
import type { StudentDashboardResponse, TeacherDashboardResponse, AdminDashboardResponse } from '../contracts/dashboard';
import { USE_MOCK, mockDriver } from '../mock';

/** GET /me/dashboard */
export async function getStudentDashboard(targetUserId?: string): Promise<StudentDashboardResponse> {
  if (USE_MOCK) {
    const userId = targetUserId || mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const data = mockDriver.getStudentDashboard(userId);
    if (!data) throw new Error("Dashboard not found for user");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<StudentDashboardResponse>(API.DASHBOARD);
  return response.data;
}

/** GET /teacher/dashboard (future endpoint) */
export async function getTeacherDashboard(): Promise<TeacherDashboardResponse> {
  if (USE_MOCK) {
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error("No mocked user session");
    const data = mockDriver.getTeacherDashboard(userId);
    if (!data) throw new Error("Dashboard not found for teacher");
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<TeacherDashboardResponse>('/teacher/dashboard');
  return response.data;
}

/** GET /admin/dashboard (future endpoint) */
export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  /** Fetches administrative metrics from the backend reporting endpoint. */
  const response = await apiClient.get<AdminDashboardResponse>('/admin/dashboard');
  return response.data;
}
