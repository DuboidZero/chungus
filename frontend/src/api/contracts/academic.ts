/**
 * Academic records API contracts.
 * Request/Response DTOs for semester CRUD endpoints.
 */

import type { Semester } from '../entities/semester';

/** GET /me/academic-records — Response */
export type AcademicRecordsResponse = Semester[];

/** POST /me/academic-records — Request */
export interface CreateSemesterRequest {
  semesterNumber: number;
  subjects: {
    name: string;
    marksObtained: number;
    maxMarks: number;
    credits: number;
  }[];
}

/** POST /me/academic-records — Response */
export type CreateSemesterResponse = Semester;

/** PATCH /me/academic-records/:id — Request */
export interface UpdateSemesterRequest {
  semesterNumber?: number;
  subjects?: {
    id?: string;
    name: string;
    marksObtained: number;
    maxMarks: number;
    credits: number;
  }[];
}

/** PATCH /me/academic-records/:id — Response */
export type UpdateSemesterResponse = Semester;

/** DELETE /me/academic-records/:id — Response (204 No Content) */
export type DeleteSemesterResponse = void;
