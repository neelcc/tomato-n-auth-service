import express from "express";
import { TenantController } from "../controllers/TenantController.js";
import { TenantService } from "../services/TenantServices.js";
import { AppDataSource } from "../config/data-source.js";
import { Tenant } from "../entity/Tenant.js";
import authenticate from "../middlewares/authenticate.js";
import { canAccess } from "../middlewares/canAccess.js";
import { Roles } from "../constants/index.js";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantcontroller = new TenantController(tenantService);

router.post("/", authenticate , canAccess([Roles.Admin]) , (req, res, next) =>
    tenantcontroller.create(req, res, next),
);

export default router;
