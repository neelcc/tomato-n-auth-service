import type { NextFunction, Response } from "express";
import type { RegisterUserRequest, UserData } from "../types/index.js";
import type { UserService } from "../services/UserService.js";
import type { Logger } from "winston";

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
            const { firstName, lastName, email, password }: UserData = req.body;
            this.logger.debug("Checking inputs from user", {
                firstName,
                lastName,
                email,
                password: "********",
            });

            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info("User has been created!", { id: user.id });
            res.status(201).json({
                id: user.id,
                role: user.role,
            });
        } catch (err) {
            next(err);
        }
    }
}
