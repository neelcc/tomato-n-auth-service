import type { NextFunction, Response } from "express";
import type { TenantService } from "../services/TenantServices.js";
import type {
    TenantQuery,
    TenantValidatedRequest,
} from "../types/index.js";
import createHttpError from "http-errors";
import type { Logger } from "winston";

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(
        req: TenantValidatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { name, address } = req.body;
        try {
            const tenant = await this.tenantService.create({ name, address });

            res.status(201).send(tenant);
        } catch (error) {
            next(error);
        }
    }

    async getList(
        req: TenantValidatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const validatedQuery = req.validatedQuery as TenantQuery;

        try {
            const [tenants, count] =
                await this.tenantService.getList(validatedQuery);

            this.logger.info("All tenant have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage,
                perPage: validatedQuery.perPage,
                total: count,
                data: tenants,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOne(
        req: TenantValidatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const tenantId = req.validatedParams?.id;

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

    async destroy(
        req: TenantValidatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const tenantId = req.validatedParams?.id;

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

    async updateOne(
        req: TenantValidatedRequest,
        res: Response,
        next: NextFunction,
    ) {
        const tenantId = req.validatedParams?.id;
        const { name, address } = req.body;

        try {
            await this.tenantService.updateById(Number(tenantId), {
                name,
                address,
            });

            this.logger.info("Tenant Updated successfully.");

            res.json({
                id: Number(tenantId),
            });
        } catch (error) {
            next(error);
        }
    }
}
