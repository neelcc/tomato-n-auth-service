import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserService } from "../services/UserService.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";
import logger from "../config/logger.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validators/auth.validation.js";
import { TokenService } from "../services/TokenService.js";
import { RefreshToken } from "../entity/RefreshToken.js";
import { CredentialService } from "../services/CredentialService.js";
import type { AuthRequest } from "../types/index.js";
import authenticate from "../middlewares/authenticate.js";
import validateRefreshtoken from "../middlewares/validateRefreshtoken.js";
import parseRefreshToken from "../middlewares/parseRefreshToken.js";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authcontroller = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

router.post("/register", validate(registerSchema), (req, res, next) =>
    authcontroller.register(req, res, next),
);

router.post("/login", validate(loginSchema), (req, res, next) =>
    authcontroller.login(req, res, next),
);

router.get("/self", authenticate, (req, res, next) =>
    authcontroller.self(req as AuthRequest, res, next),
);

router.post("/refresh", validateRefreshtoken, (req, res, next) =>
    authcontroller.refresh(req as AuthRequest, res, next),
);

router.post("/logout", authenticate, parseRefreshToken, (req, res, next) =>
    authcontroller.logout(req as AuthRequest, res, next),
);

export default router;
