export interface UserProfile {
  name: string | null;
  degree: string | null;
  qualifications: string | null;
  skills: string | null;
  gemini_api_key: string | null;
  profile_picture_base64: string | null;
  cv_pdf_base64: string | null;
  cv_text: string | null;
}

export interface RoadmapStep {
  step: number;
  action: string;
  details: string;
}

export interface CareerPath {
  career_path: string;
  suitability_reason: string;
  required_skills: string[];
  roadmap: RoadmapStep[];
}

export interface User {
  email: string;
  name?: string | null;
}