import { z } from "zod";
import {
    JobLevel,
    JobRole,
    OpportunitySource,
    OpportunityStatus,
    RequiredSkills,
} from "../types/types";

export const createCaptureJobSchema = z.object({
    companyName: z.string().min(1),
    jobName: z.enum(JobRole),
    jobLevel: z.enum(JobLevel),
    opportunityStatus: z.enum(OpportunityStatus).default(OpportunityStatus.SAVED),
    jobUrl: z.url(),
    source: z.enum(OpportunitySource),
    requiredSkills: z.array(z.enum(RequiredSkills)).optional(),
});