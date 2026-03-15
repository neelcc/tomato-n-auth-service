import "reflect-metadata";
import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";

import type { HttpError } from "http-errors";
import logger from "./config/logger.js";
import authRouter from "./routes/auth.js";
import tenantRouter from "./routes/tenant.js";
import z from "zod";
import cookieParser from "cookie-parser";
import path from "node:path";
import jwks from "../public/.well-known/jwks.json" with { type: "json" };

const app = express();
app.use(express.json());
app.use(cookieParser());
console.log("CWD:", process.cwd());
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
    res.send("Server is workings");
});

app.get("/.well-known/jwks.json", (req, res) => {
    res.json(jwks);
});

app.use("/auth", authRouter);
app.use("/tenant", tenantRouter);

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);

    if (err instanceof z.ZodError) {
        return res.status(400).json({
            errors: z.treeifyError(err),
            msg: "Hello",
        });
    }

    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
