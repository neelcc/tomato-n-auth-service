import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { canAccess } from "../middlewares/canAccess.js";
import { Roles } from "../constants/index.js";
import {  UserController } from "../controllers/UserController.js";
import { UserService } from "../services/UserService.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.js";
import { updateUserSchema, userIdSchema, userListSchema } from "../validators/user.validation.js";
import logger from "../config/logger.js";
import type { AuthenticatedCreateUserRequest } from "../types/index.js";

const router = express.Router();
const userRepository =  AppDataSource.getRepository(User)
const userService = new UserService(userRepository);
const usercontroller = new UserController(
    userService,
    logger
);

router.post("/", authenticate, canAccess([Roles.Admin]), (req, res, next) =>
    usercontroller.create(req  as AuthenticatedCreateUserRequest , res, next),
);

router.get("/:id",authenticate, canAccess([Roles.Admin]), validateParams(userIdSchema) , (req,res,next)=>
    usercontroller.getOne(req,res,next)
);

router.get("/",authenticate, canAccess([Roles.Admin]), validateQuery(userListSchema) , (req,res,next)=>
    usercontroller.getList(req,res,next)
);

router.patch("/update/:id",authenticate, canAccess([Roles.Admin]), validateBody(updateUserSchema) ,validateParams(userIdSchema), (req,res,next)=>
    usercontroller.update(req,res,next)
);

router.get("/delete/:id",authenticate, canAccess([Roles.Admin]), validateParams(userIdSchema),   (req,res,next)=>
    usercontroller.destroy(req,res,next)
)




export default router;
