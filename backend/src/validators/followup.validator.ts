import { z } from "zod";

export const createFollowupSchema = z.object({
    outreachId: z.string(),
    message: z.string().optional(),
    notes: z.string().optional(),
    sentAt: z.coerce.date().optional(),
});

export const updateFollowupSchema = z.object({
    message: z.string().optional(),
    notes: z.string().optional(),
});