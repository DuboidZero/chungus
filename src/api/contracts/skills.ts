/**
 * Skills API contracts.
 * Request/Response DTOs for skills CRUD endpoints.
 */

import type { TechnicalSkill, SoftSkill, LanguageSkill, LanguageProficiency } from '../entities/skill';

/** GET /me/skills — Response */
export interface SkillsResponse {
  technical: TechnicalSkill[];
  soft: SoftSkill[];
  languages: LanguageSkill[];
}

/** POST /me/skills/technical — Request */
export interface CreateTechnicalSkillRequest {
  domain: string;
  name: string;
  proficiency: number;
}

/** POST /me/skills/soft — Request */
export interface CreateSoftSkillRequest {
  name: string;
  proficiency?: number;
}

/** POST /me/skills/languages — Request */
export interface CreateLanguageSkillRequest {
  name: string;
  proficiency: LanguageProficiency;
}

/** POST /me/skills/* — Response (returns the created skill) */
export type CreateTechnicalSkillResponse = TechnicalSkill;
export type CreateSoftSkillResponse = SoftSkill;
export type CreateLanguageSkillResponse = LanguageSkill;

/** DELETE /me/skills/:type/:id — Response (204 No Content) */
export type DeleteSkillResponse = void;
