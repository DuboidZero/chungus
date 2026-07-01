/**
 * Users service.
 */
import { apiClient } from '../client';
import { API } from '../endpoints';
import { USE_MOCK, mockDriver } from '../mock';

export async function getTeachers(): Promise<{id: string; name: string; email: string; role: string}[]> {
  if (USE_MOCK) {
    const data = mockDriver.getAllTeachers();
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get(API.TEACHERS);
  return response.data;
}

export async function updateUser(userId: string, data: any): Promise<any> {
  if (USE_MOCK) {
    const updated = mockDriver.updateUser(userId, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return updated;
  }
  const response = await apiClient.patch(`/admin/users/${userId}`, data);
  return response.data;
}

export async function resetUserPassword(userId: string): Promise<boolean> {
  if (USE_MOCK) {
    mockDriver.resetUserPassword(userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
  await apiClient.post(`/admin/users/${userId}/reset-password`);
  return true;
}

export async function toggleUserStatus(userId: string): Promise<any> {
  if (USE_MOCK) {
    const updated = mockDriver.toggleUserStatus(userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return updated;
  }
  const response = await apiClient.post(`/admin/users/${userId}/toggle-status`);
  return response.data;
}
