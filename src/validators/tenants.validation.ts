import z from "zod";

export const updateByIdSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    address: z
        .string()
        .min(1, "address is required in detailed")
        .max(255, "address is too long"),
});

export const tenantIdSchema = z.object({
    id: z.coerce.number("Invalid Id Param"),
});

export const tenantQuerySchema = z.object({
    q: z.string("Not a string").trim().default(""),

    currentPage: z.coerce.number().int().positive().default(1),

    perPage: z.coerce.number().int().positive().default(10),
});
