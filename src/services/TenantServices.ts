import type { Repository } from "typeorm";
import type { Tenant } from "../entity/Tenant.js";
import type { ITenant, TenantQueryParams } from "../types/index.js";

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

    async updateById(id: number, tenantData: ITenant) {
        return await this.TenantRepository.update(id, tenantData);
    }

    async getList(param: TenantQueryParams) {
        const queryBuilder = this.TenantRepository.createQueryBuilder("tenant");

        if (param.q) {
            const searchTerm = `%${param.q}%`;

            queryBuilder.where(
                "CONCAT(tenant.name, ' ' ,tenant.address) ILike :q",
                {
                    q: searchTerm,
                },
            );
        }

        const result = await queryBuilder
            .skip((param.currentPage - 1) * param.perPage)
            .take(param.perPage)
            .orderBy("tenant.id", "DESC")
            .getManyAndCount();

        return result;
    }
}
