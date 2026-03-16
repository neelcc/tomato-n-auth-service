import type { NextFunction, Request, Response } from "express";
import type { TenantService } from "../services/TenantServices.js";
import type { CreateTenantRequest } from "../types/index.js";
import createHttpError from "http-errors";
import type { Logger } from "winston";

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        try {
            const tenant = await this.tenantService.create({ name, address });

            res.status(201).send(tenant);
        } catch (error) {
            next(error);
        }
    }

    getList(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(201).send();
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            const error = createHttpError(400, "Invalid Url Param");
            next(error);
            return;
        }

        try {
            const tenant = await this.tenantService.getById(Number(tenantId));

            if (!tenant) {
                const error = createHttpError(400, "Tenant does not exist");
                next(error);
                return;
            }

            this.logger.info("Tenant fetched successfully.");

            res.json(tenant);
        } catch (error) {
            next(error);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            const error = createHttpError(400, "Invalid Url Param");
            next(error);
            return;
        }

        try {
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info("Tenant Deleted successfully.", {
                id: Number(tenantId),
            });

            res.json({
                id: Number(tenantId),
            });
        } catch (error) {
            next(error);
        }
    }

    async updateOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            const error = createHttpError(400, "Invalid Url Param");
            next(error);
            return;
        }

        try {
            const tenant = await this.tenantService.getById(Number(tenantId));

            if (!tenant) {
                const error = createHttpError(400, "Tenant does not exist");
                next(error);
                return;
            }

            this.logger.info("Tenant fetched successfully.");

            res.json(tenant);
        } catch (error) {
            next(error);
        }
    }
}
