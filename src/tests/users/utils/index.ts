import type { DataSource, Repository } from "typeorm";
import type { Tenant } from "../../../entity/Tenant.js";

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJwt = (token: string | null): boolean => {
    if (token === null) {
        return false;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
        return false;
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        return false;
    }
};


export const CreateTenant = async (repository : Repository<Tenant>) => {
    return await repository.save({
        name : "Local Kitchen",
        address : "12 London Indiana"
    })
}