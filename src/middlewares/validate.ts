import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validate =
    <T>(schema: z.ZodType<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(result.error);
        }

        req.body = result.data;
        next();
    };
