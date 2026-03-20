import "reflect-metadata";
import express, { type Request, type Response } from "express";
import type { HttpError } from "http-errors";
import logger from "./config/logger.js";
import authRouter from "./routes/auth.js";
import tenantRouter from "./routes/tenant.js";
import userRouter from "./routes/user.js";
import z from "zod";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs/promises";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/.well-known/jwks.json", async (req: Request, res: Response) => {
    try {
        const jwksPath = path.join(
            process.cwd(),
            "public/.well-known/jwks.json",
        );

        const fileContent = await fs.readFile(jwksPath, "utf-8");

        res.setHeader("Content-Type", "application/json");
        res.send(fileContent);
    } catch (error) {
        console.error("JWKS error:", error);
        res.status(500).json({
            error: "Failed to load JWKS",
        });
    }
});

app.get("/", (req, res) => {
    res.send("Server is working");
});

app.use("/auth", authRouter);
app.use("/tenant", tenantRouter);
app.use("/user", userRouter);

// global error handler
app.use((err: HttpError, req: Request, res: Response) => {
    logger.error(err.message);

    if (err instanceof z.ZodError) {
        return res.status(400).json({
            success: false,
            errors: err.treeify(),
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
