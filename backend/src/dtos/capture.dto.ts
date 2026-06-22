import { JobLevel, JobRole, OpportunitySource, OpportunityStatus, RequiredSkills } from "../types/types";

export interface CreateCaptureJobDto {
    companyName: string;
    jobName: JobRole;
    jobLevel: JobLevel;
    opportunityStatus: OpportunityStatus;
    jobUrl: string;
    source: OpportunitySource
    requiredSkills?: RequiredSkills[]
};

export interface CapturedJobsQueryDto {
    search?: string;
};

export interface CompanyJobsParamsDto {
    companyId: string;
};
