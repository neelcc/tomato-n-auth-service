import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index.js";
import type { UserService } from "../services/UserService.js";
import type { Logger } from "winston";
import jwt, { type JwtPayload } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import { Config } from "../config/index.js";
import { AppDataSource } from "../config/data-source.js";
import { RefreshToken } from "../entity/RefreshToken.js";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            this.logger.debug("Checking inputs from user", {
                ...req.body,
                password: "********",
            });

            const user = await this.userService.create(req.body);
            let privateKey: Buffer;
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, "../certs/private.pem"),
                );

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                const error = createHttpError(
                    500,
                    "Error while reading private key",
                );
                next(error);
                return;
            }

            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            });

            console.log(newRefreshToken);

            const accessToken = jwt.sign(payload, privateKey, {
                algorithm: "RS256",
                issuer: "auth-service",
                expiresIn: "1h",
            });

            const refreshToken = jwt.sign(
                payload,
                Config.REFRESH_TOKEN_SECRET,
                {
                    algorithm: "HS256",
                    issuer: "auth-service",
                    expiresIn: "1y",
                    jwtid: String(newRefreshToken.id),
                },
            );

            this.logger.info("User has been created!", { id: user.id });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                httpOnly: true,
                maxAge: 1000 * 60 * 60,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                httpOnly: true,
                maxAge: 1000 * 60 * 60,
            });

            res.status(201).json({
                id: user.id,
                role: user.role,
            });
        } catch (err) {
            next(err);
        }
    }
}
