// Type definitions for Buddy

export interface PersonalInfo {
  name: {
    first: string;
    last: string;
    full: string;
  };
  contact: {
    email: string;
    phone: string;
    location: {
      city: string;
      state: string;
      country: string;
      address: string;
      zipCode?: string;
    };
  };
  links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
  legal?: {
    citizenship?: string;
    workAuthorization?: string;
    requiresSponsorship?: boolean;
  };
}

export interface ProfessionalInfo {
  title: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string | 'present';
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa?: string;
}

export interface Skills {
  languages: string[];
  frontend: string[];
  backend: string[];
  databases: string[];
  tools: string[];
  soft: string[];
}

export interface Preferences {
  job: {
    roles: string[];
    locations: string[];
    salaryMin?: number;
    jobType: string[];
    industries: string[];
    remote: boolean;
  };
  writing: {
    tone: string;
    style: string;
    avoid: string[];
  };
  automation: {
    autoFill: boolean;
    requireConfirmation: boolean;
    saveApplications: boolean;
  };
}

export interface DataDocument {
  id: string;
  type: 'personal' | 'professional' | 'resume' | 'skill' | 'preference' | 'answer';
  content: string;
  metadata: {
    source: string;
    category?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: any;
  score: number;
}

export interface RAGContext {
  query: string;
  relevantDocs: SearchResult[];
  context: string;
}

