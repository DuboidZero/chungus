/**
 * Profile types — re-exported from the canonical API entity.
 * Local utilities (calcCompletion) and form-specific types remain here.
 */

export type { Profile, InternshipPreference, DomainInterest } from '../../api/entities/profile';
export { DOMAIN_OPTIONS } from '../../api/entities/profile';

/**
 * Local form state for profile editing.
 * Omits server-generated fields (id, userId, createdAt, updatedAt).
 */
export interface StudentProfileData {
  avatarUrl?: string;
  aboutMe: string;
  email: string;
  phone: string;
  location: string;
  internshipPreference: 'online' | 'offline' | 'none';
  preferredRadius: string;
  domainInterest?: string;
}

/**
 * Evaluates the percentage of profile fields completed by the user.
 */
export function calcCompletion(p: StudentProfileData): number {
  const fields: (string | undefined)[] = [
    p.aboutMe,
    p.email,
    p.phone,
    p.location,
    p.internshipPreference !== 'none' ? p.internshipPreference : undefined,
    p.domainInterest,
  ];
  const optional = fields.filter(f => f !== undefined);
  const filled = optional.filter(f => f && f.trim().length > 0);
  return Math.round((filled.length / optional.length) * 100);
}
