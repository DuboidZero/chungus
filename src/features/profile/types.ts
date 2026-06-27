/** Centralized data model representing a student's portfolio profile. */
export type InternshipPreference = 'online' | 'offline' | 'none';

export interface StudentProfileData {
  /** Personal demographic information */
  avatarUrl?: string;
  aboutMe: string;
  /** Contact details */
  email: string;        // pre-seeded from auth
  phone: string;
  location: string;
  /** Internship and placement preferences */
  internshipPreference: InternshipPreference;
  preferredRadius: string; // only relevant if preference === 'offline'
}

/** Evaluates the percentage of profile fields completed by the user. */
export function calcCompletion(p: StudentProfileData): number {
  const fields: (string | undefined)[] = [
    p.aboutMe,
    p.email,          // always filled
    p.phone,
    p.location,
    p.internshipPreference !== 'none' ? p.internshipPreference : undefined,
  ];
  const optional = fields.filter(f => f !== undefined);
  const filled   = optional.filter(f => f && f.trim().length > 0);
  return Math.round((filled.length / optional.length) * 100);
}
