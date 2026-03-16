import "reflect-metadata";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import app from "../../app.js";
import request from "supertest";
import { Tenant } from "../../entity/Tenant.js";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../constants/index.js";

describe("POST /tenant/", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock("http://localhost:5501");
    });

    beforeEach(async () => {
        // Database Truncate
        const entities = connection.entityMetadatas;
        for (const entity of entities) {
            const repository = connection.getRepository(entity.name);
            await repository.query(
                `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`,
            );
        }
        await connection.synchronize(true);
        jwks.start();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    afterEach(() => {
        jwks.stop();
    });

    describe("Fields are not missing", () => {
        it("should send 201 status code", async () => {
            const tenantData = {
                name: "Aai Ekvira",
                address: "Lonavala",
            };

            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            const response = await request(app)
                .post("/tenant/")
                .set("Cookie", [`accessToken=${AdminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(201);
        });

        it("should check whether tenant data is stored", async () => {
            const tenantData = {
                name: "Aai Ekvira",
                address: "Lonavala",
            };

            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            const tenantRepository = AppDataSource.getRepository(Tenant);
            await request(app)
                .post("/tenant/")
                .set("Cookie", `accessToken=${AdminToken}`)
                .send(tenantData);
            const tenants = await tenantRepository.find();

             
            expect(tenants).toHaveLength(1);
            expect(tenants[0]?.name).toBe(tenantData.name);
        });

        it("should send 401 if user is not authenticated", async () => {
            const tenantData = {
                name: "Aai Ekvira",
                address: "Lonavala",
            };

            const response = await request(app)
                .post("/tenant")
                .send(tenantData);

            expect(response.statusCode).toBe(401);
        });

        it("should send 403 if the user role is not authorized", async () => {
            const tenantData = {
                name: "Aai Ekvira",
                address: "Lonavala",
            };

            const ManagerToken = jwks.token({
                sub: "1",
                role: Roles.Manager,
            });
            const tenants = AppDataSource.getRepository(Tenant);
            const response = await request(app)
                .post("/tenant")
                .set("Cookie", `accessToken=${ManagerToken}`)
                .send(tenantData);
            const tenant = await tenants.find();

            expect(response.statusCode).toBe(403);

            expect(tenant).toHaveLength(0);
        });

        it("should send 201 if the user is authorized", async () => {
            const tenantData = {
                name: "Aai Ekvira",
                address: "Lonavala",
            };

            const ManagerToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });
            const tenants = AppDataSource.getRepository(Tenant);
            const response = await request(app)
                .post("/tenant")
                .set("Cookie", `accessToken=${ManagerToken}`)
                .send(tenantData);
            const tenant = await tenants.find();

            expect(response.statusCode).toBe(201);

            expect(tenant).toHaveLength(1);
        });

        it("should get the user by Id ", async () => {
            const tenantData = {
                name: "Aai Ekvira",
                address: "Lonavala",
            };

            const tenantsRepository = AppDataSource.getRepository(Tenant);

            await tenantsRepository.save(tenantData);

            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            const tenants = await tenantsRepository.find();

            console.log(tenants);

            const response = await request(app)
                .get(`/tenant/${tenants[0]?.id}`)
                .set("Cookie", `accessToken=${AdminToken}`)
                .send(tenantData);

            console.log("Hello");

            console.log(response.body);

            expect((response.body as Record<string, string>).name).toBe(
                tenantData.name,
            );

            expect((response.body as Record<string, string>).address).toBe(
                tenantData.address,
            );
        });

        it("should delete the user by Id ", async () => {
            const tenantData = {
                name: "Aai Ekvira",
                address: "Lonavala",
            };

            const tenantsRepository = AppDataSource.getRepository(Tenant);

            await tenantsRepository.save(tenantData);

            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            const tenants = await tenantsRepository.find();

            const response = await request(app)
                .post(`/tenant/delete/${tenants[0]?.id}`)
                .set("Cookie", `accessToken=${AdminToken}`)
                .send(tenantData);

            expect((response.body as Record<string, number>).id).toBe(
                tenants[0]?.id,
            );
        });
    });

    describe("Fields are missing", () => {
        it.todo("should if any field is missing return 400 ", async () => {});
    });
});
