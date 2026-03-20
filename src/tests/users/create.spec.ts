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
import request from "supertest";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import createJWKSMock from "mock-jwks";
import app from "../../app.js";
import { User } from "../../entity/User.js";
import { Roles } from "../../constants/index.js";
import { Tenant } from "../../entity/Tenant.js";
import { CreateTenant } from "./utils/index.js";

describe("POST /user/", () => {
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
        it("should persist the user in database", async () => {
            const tenant = await CreateTenant(connection.getRepository(Tenant));

            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
                tenantId: tenant.id,
            };
            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            await request(app)
                .post("/user/")
                .set("Cookie", `accessToken=${AdminToken}`)
                .send(userData);

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0]?.firstName).toBe(userData.firstName);
        });

        it("should check the user is manager", async () => {
            const tenant = await CreateTenant(connection.getRepository(Tenant));

            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
                tenantId: tenant.id,
            };
            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            await request(app)
                .post("/user")
                .set("Cookie", `accessToken=${AdminToken}`)
                .send(userData);

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0]?.role).toBe(Roles.Admin);
        });

        it("should return 403 if non user is try to create manager user", async () => {
            const tenant = await CreateTenant(connection.getRepository(Tenant));

            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
                tenantId: tenant.id,
            };
            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/user")
                .set("Cookie", `accessToken=${AdminToken}`)
                .send(userData);

            expect(response.statusCode).toBe(403);
        });

        it("should get by id", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
                tenantId: 1,
            };
            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            const userRepository = AppDataSource.getRepository(User);

            await userRepository.save(userData);
            const users = await userRepository.find();

            const response = await request(app)
                .get(`/user/${users[0]?.id}`)
                .set("Cookie", `accessToken=${AdminToken}`)
                .send(userData);

            expect((response.body as Record<string, string>).firstName).toBe(
                userData.firstName,
            );
        });

        it("should delete by id", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
                tenantId: 1,
            };
            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            const userRepository = AppDataSource.getRepository(User);

            await userRepository.save(userData);

            const users = await userRepository.find();

            await request(app)
                .get(`/user/delete/${users[0]?.id}`)
                .set("Cookie", `accessToken=${AdminToken}`)
                .send(userData);

            const newUserList = await userRepository.find();

            expect(newUserList).toHaveLength(0);
        });

        it("should update the user", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
            };

            const tenantData = {
                name: "Magan Laal Chikki",
                address: "Lonavala",
            };

            const tenantsRepository = AppDataSource.getRepository(Tenant);

            await tenantsRepository.save(tenantData);

            const newUserData = {
                firstName: "Meetccx",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                tenantId: 1,
                role: Roles.Admin,
            };

            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            const userRepository = AppDataSource.getRepository(User);

            await userRepository.save(userData);

            const user = await userRepository.find();

            const response = await request(app)
                .patch(`/user/update/${user[0]?.id}`)
                .set("Cookie", `accessToken=${AdminToken}`)
                .send(newUserData);

            expect((response.body as Record<string, string>).firstName).toBe(
                newUserData.firstName,
            );
        });

        it("should get list of users", async () => {
            const userDataOne = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
                tenantId: 1,
            };

            const userDataTwo = {
                firstName: "Meetcc",
                lastName: "Chaurasiya",
                email: "neelx@gmail.com",
                password: "iloveneha",
                tenantId: 2,
            };

            const AdminToken = jwks.token({
                sub: "1",
                role: Roles.Admin,
            });

            const userRepository = AppDataSource.getRepository(User);

            await userRepository.save(userDataOne);
            await userRepository.save(userDataTwo);

            const response = await request(app)
                .get(`/user/`)
                .set("Cookie", `accessToken=${AdminToken}`)
                .send();

            expect((response.body as Record<string, number>).total).toBe(2);
        });
    });

    describe("Fields are missing", () => {
        it.todo("should if any field is missing return 400 ", async () => {});
    });
});
