import { z } from "zod";

export const registerSchema = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .transform((val) => val.trim()),

    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .transform((val) => val.trim()),

    email: z.string().transform((val) => val.trim().toLowerCase()),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(12, "Password must be at least 12 characters")
        .transform((val) => val.trim()),
});

export type RegisterInput = z.infer<typeof registerSchema>;
