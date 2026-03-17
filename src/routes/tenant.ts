import express from "express";
import { TenantController } from "../controllers/TenantController.js";
import { TenantService } from "../services/TenantServices.js";
import { AppDataSource } from "../config/data-source.js";
import { Tenant } from "../entity/Tenant.js";
import authenticate from "../middlewares/authenticate.js";
import { canAccess } from "../middlewares/canAccess.js";
import { Roles } from "../constants/index.js";
import logger from "../config/logger.js";
import {
    validateBody,
    validateParams,
    validateQuery,
} from "../middlewares/validate.js";
import {
    tenantIdSchema,
    tenantQuerySchema,
    updateByIdSchema,
} from "../validators/tenants.validation.js";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantcontroller = new TenantController(tenantService, logger);

router.post("/", authenticate, canAccess([Roles.Admin]), (req, res, next) =>
    tenantcontroller.create(req, res, next),
);

router.get("/", validateQuery(tenantQuerySchema), (req, res, next) =>
    tenantcontroller.getList(req, res, next),
);

router.get(
    "/:id",
    authenticate,
    canAccess([Roles.Admin]),
    validateParams(tenantIdSchema),
    (req, res, next) => tenantcontroller.getOne(req, res, next),
);

router.post(
    "/delete/:id",
    authenticate,
    canAccess([Roles.Admin]),
    validateParams(tenantIdSchema),
    (req, res, next) => tenantcontroller.destroy(req, res, next),
);

router.patch(
    "/update/:id",
    authenticate,
    canAccess([Roles.Admin]),
    validateBody(updateByIdSchema),
    validateParams(tenantIdSchema),
    (req, res, next) => tenantcontroller.updateOne(req, res, next),
);

export default router;
