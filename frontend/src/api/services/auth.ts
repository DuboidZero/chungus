/**
 * Auth service.
 * Wraps API calls for authentication endpoints.
 */

import { apiClient } from '../client';
import { API } from '../endpoints';
import type { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, MeResponse, ChangePasswordRequest, ForgotPasswordRequest } from '../contracts/auth';
import { USE_MOCK, mockDriver } from '../mock';

/** POST /auth/login */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDriver.login(data.identifier, data.password);
  }
  const response = await apiClient.post<LoginResponse>(API.AUTH.LOGIN, data);
  return response.data;
}

/** POST /auth/logout */
export async function logout(): Promise<void> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  await apiClient.post(API.AUTH.LOGOUT);
}

/** POST /auth/refresh */
export async function refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.post<RefreshTokenResponse>(API.AUTH.REFRESH, data);
  return response.data;
}

/** GET /me */
export async function getMe(): Promise<MeResponse> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    const user = mockDriver.getMe(userId);
    if (!user) throw new Error('User not found');
    return user;
  }
  const response = await apiClient.get<MeResponse>(API.ME);
  return response.data;
}

/** POST /auth/change-password */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userId = mockDriver.getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    mockDriver.changePassword(userId, data.currentPassword, data.newPassword);
    return;
  }
  await apiClient.post('/auth/change-password', data);
}

/** POST /auth/forgot-password */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockDriver.forgotPassword(data.identifier);
    return;
  }
  await apiClient.post('/auth/forgot-password', data);
}
