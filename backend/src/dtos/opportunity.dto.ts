import { JobLevel, JobRole, OpportunitySource, OpportunityStatus, RequiredSkills } from "../types/types";

export interface CreateOpportunityDto {
    companyId: string;
    jobRole: JobRole;
    jobLevel: JobLevel;
    source?: OpportunitySource;
    jobUrl?: string;
    jobDescription?: string;
    requiredSkills?: RequiredSkills[];
    notes?: string;
    appliedAt?: Date,
    status?: OpportunityStatus;
    resumeId?: string;
}

export interface UpdateOpportunityDto {
  jobRole?: JobRole;
  jobLevel?: JobLevel;
  source?: OpportunitySource;
  jobUrl?: string;
  jobDescription?: string;
  requiredSkills?: RequiredSkills[];
  notes?: string;
  appliedAt?: Date,
  status?: OpportunityStatus;
  resumeId?: string;
}

export interface OpportunityQueryDto {
  search?: string;
  companyId?: string;
  status?: OpportunityStatus;
  jobRole?: JobRole;
  requiredSkills?: RequiredSkills;
  jobLevel?: JobLevel;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  startDate?: string;
  endDate?: string;
}