import {z} from "zod";

export const createCompanySchema = z.object({
    
    name: z.string().trim().min(1, "Company name is required").max(100),
    website: z.url().optional(),
    linkedinUrl: z.url().optional(),
})

export const updateCompanySchema = createCompanySchema.partial();