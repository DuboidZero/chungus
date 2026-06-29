/**
 * Auth service.
 * Wraps API calls for authentication endpoints.
 * TODO: Implement when backend auth is ready.
 */

import { apiClient } from '../client';
import { API } from '../endpoints';
import type { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, MeResponse } from '../contracts/auth';

/** POST /auth/login */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
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
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.get<MeResponse>(API.ME);
  return response.data;
}
