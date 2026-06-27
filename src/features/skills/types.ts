export interface TechnicalSkill {
  id: string;
  domain: string;
  name: string;
  proficiency: number; // 1 to 5
}

export interface SoftSkill {
  id: string;
  name: string;
  proficiency?: number; // 1 to 5, optional
}

export interface LanguageSkill {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Proficient' | 'Fluent' | 'Native';
}

export interface SkillsData {
  technical: TechnicalSkill[];
  soft: SoftSkill[];
  languages: LanguageSkill[];
}
