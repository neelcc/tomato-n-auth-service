import type { Response } from "express";
import type { RegisterUserRequest, UserData } from "../types/index.js";
import type { UserService } from "../services/UserService.js";

export class AuthController {
    userService: UserService;
    constructor(userService: UserService) {
        this.userService = userService;
    }

    async register(req: RegisterUserRequest, res: Response) {
        const { firstName, lastName, email, password }: UserData = req.body;
        await this.userService.create({ firstName, lastName, email, password });
        res.status(201).json();
    }
}
