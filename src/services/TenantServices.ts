import type { Repository } from "typeorm";
import type { Tenant } from "../entity/Tenant.js";
import type { ITenant } from "../types/index.js";

export class TenantService {
    TenantRepository: Repository<Tenant>;

    constructor(TenantRepository: Repository<Tenant>) {
        this.TenantRepository = TenantRepository;
    }

    async create(tenantData: ITenant) {
        return await this.TenantRepository.save(tenantData);
    }

    async getById(tenantId: number) {
        return await this.TenantRepository.findOne({
            where: {
                id: tenantId,
            },
        });
    }

    async deleteById(tenantId: number) {
        return await this.TenantRepository.delete(tenantId);
    }
}
