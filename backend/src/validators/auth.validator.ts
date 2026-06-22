import z from "zod";

export const googleLoginSchema = z.object({
    idToken: z.string().min(1, "Google token is required"),
})

export const devLoginSchema = z.object({
    email: z.email(),
    name: z.string().optional(),
});