/**
 * Auth API contracts.
 * Request/Response DTOs for authentication endpoints.
 */

import type { User } from '../entities/user';

/** POST /auth/login — Request */
export interface LoginRequest {
  identifier: string;
  password: string;
}

/** POST /auth/login — Response */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  firstLogin: boolean;
}

/** POST /auth/change-password — Request */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** POST /auth/forgot-password — Request */
export interface ForgotPasswordRequest {
  identifier: string;
}

/** POST /auth/refresh — Request */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** POST /auth/refresh — Response */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/** GET /me — Response */
export type MeResponse = User;
