import { z } from "zod";

import { TemplateType } from "../types/types";

export const createTemplateSchema =
    z.object({
        name: z.string(),
        type: z.enum(TemplateType),
        subject: z.string().optional(),
        content: z.string(),
        isDefault: z.boolean().optional(),
    });

export const updateTemplateSchema = createTemplateSchema.omit({ type: true, }).partial();