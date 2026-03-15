import type { NextFunction, Response } from "express";
import type { TenantService } from "../services/TenantServices.js";
import type { CreateTenantRequest } from "../types/index.js";

export class TenantController {
    constructor(private tenantService: TenantService) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        try {
            const tenant = await this.tenantService.create({ name, address });

            res.status(201).send(tenant);
        } catch (error) {
            next(error);
        }
    }
}
