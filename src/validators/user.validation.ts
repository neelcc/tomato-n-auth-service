import z from "zod";

export const userIdSchema = z.object({
    id : z.
         coerce.number("Invalid Url Params")
})


export const updateUserSchema = z.object({
    firstName: z.string()
        .trim()
        .min(1, "First name is required!"),
    
    lastName: z.string()
        .trim()
        .min(1, "Last name is required!"),
    
    role: z.string()
        .trim()
        .min(1, "Role is required!"),
    
    email: z
        .string()
        .trim()
        .min(1, "Email is required!"),
    
    tenantId: z.number().optional(),
})
.refine(
    (data) => {
        
        // If role is admin, tenantId is optional
        if (data.role === "admin") {
            return true;
        }
        // Otherwise, tenantId is required
        return !!data.tenantId;
    },
    {
        message: "Tenant id is required!",
        path: ["tenantId"],
    }
);

export const userListSchema = z.object({
    q: z.string("Not a string").trim().default(""),

    role : z.string().default(""),

    currentPage: z.coerce.number().int().positive().default(1),

    perPage: z.coerce.number().int().positive().default(10),
});


// Type export for TypeScript
export type UpdateUserInput = z.infer<typeof updateUserSchema>;