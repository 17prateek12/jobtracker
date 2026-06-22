import { z } from "zod";
import { ContactRole, OutreachStatus, OutreachType, } from "../types/types";

export const createOutreachSchema = z.object({
    opportunityId: z.string(),
    type: z.enum(OutreachType),
    contactName: z.string().optional(),
    contactRole: z.enum(ContactRole).optional(),
    linkedinUrl: z.url().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    message: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(OutreachStatus).optional(),
    sentAt: z.coerce.date().optional(),
    nextFollowupAt: z.coerce.date().optional(),
});

export const updateOutreachSchema = createOutreachSchema.omit({ opportunityId: true, })
    .extend({
        response: z.string().optional(),
        isSuccessful: z.boolean().optional(),
    })
    .partial();