/**
 * Skill types — re-exported from the canonical API entities.
 */

export type { TechnicalSkill, SoftSkill, LanguageSkill, LanguageProficiency } from '../../api/entities/skill';

export interface SkillsData {
  technical: import('../../api/entities/skill').TechnicalSkill[];
  soft: import('../../api/entities/skill').SoftSkill[];
  languages: import('../../api/entities/skill').LanguageSkill[];
}
