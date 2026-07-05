/**
 * Profile API contracts.
 * Request/Response DTOs for student profile endpoints.
 */

import type { Profile, InternshipPreference } from '../entities/profile';

/** GET /me/profile — Response */
export type ProfileResponse = Profile;

/** PATCH /me/profile — Request */
export interface UpdateProfileRequest {
  avatarUrl?: string;
  aboutMe?: string;
  phone?: string;
  location?: string;
  internshipPreference?: InternshipPreference;
  preferredRadius?: string;
}

/** PATCH /me/profile — Response */
export type UpdateProfileResponse = Profile;
