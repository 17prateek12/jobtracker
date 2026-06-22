import { z } from "zod";
import { JobLevel, JobRole, OpportunitySource, OpportunityStatus, RequiredSkills } from "../types/types";

export const createOpportunitySchema = z.object({
    companyId: z.string(),
    jobRole: z.enum(JobRole),
    jobLevel: z.enum(JobLevel),
    source: z.enum(OpportunitySource).optional(),
    status: z.enum(OpportunityStatus).optional(),
    jobUrl: z.url().optional(),
    jobDescription: z.string().optional(),
    notes: z.string().optional(),
    requiredSkills: z.array(z.enum(RequiredSkills)).optional(),
    appliedAt: z.coerce.date().optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.omit({ companyId: true, }).partial();