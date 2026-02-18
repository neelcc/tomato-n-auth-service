import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index.js";
import type { UserService } from "../services/UserService.js";
import type { Logger } from "winston";
import { type JwtPayload } from "jsonwebtoken";
import type { TokenService } from "../services/TokenService.js";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
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
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
                
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

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
