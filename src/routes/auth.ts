import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserService } from "../services/UserService.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";
import logger from "../config/logger.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema } from "../validators/auth.validation.js";
import { TokenService } from "../services/TokenService.js";
import { RefreshToken } from "../entity/RefreshToken.js";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);

const authcontroller = new AuthController(userService, logger, tokenService);

router.post("/register", validate(registerSchema), (req, res, next) =>
    authcontroller.register(req, res, next),
);

export default router;
