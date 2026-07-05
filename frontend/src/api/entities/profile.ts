/**
 * Student profile entity.
 * Personal, contact, and internship preference data owned by the student.
 */

export type InternshipPreference = 'online' | 'offline' | 'none';

export const DOMAIN_OPTIONS = [
  'Web Development',
  'AI / ML',
  'Mobile',
  'Cybersecurity',
  'IoT',
  'Cloud & DevOps',
  'Data Science',
  'Blockchain',
  'Game Development',
  'Other',
] as const;

export type DomainInterest = typeof DOMAIN_OPTIONS[number];

export interface Profile {
  id: string;
  userId: string;
  avatarUrl?: string;
  aboutMe: string;
  email: string;
  phone: string;
  location: string;
  internshipPreference: InternshipPreference;
  preferredRadius: string;
  domainInterest?: DomainInterest | string; // Student's primary domain interest
  createdAt: string;
  updatedAt: string;
}
