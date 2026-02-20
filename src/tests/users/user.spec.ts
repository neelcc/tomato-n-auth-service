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
import request from "supertest";
import app from "../../app.js";
import createJWKSMock from "mock-jwks";
import { User } from "../../entity/User.js";
import { Role } from "../../constants/index.js";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock("http://localhost:5501");
    });

    afterEach(() => {
        jwks.stop();
    });

    beforeEach(async () => {
        // Database Truncate
        await connection.dropDatabase();
        await connection.synchronize(true);
        jwks.start();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return the status code 200", async () => {
            const accessToken = jwks.token({
                sub: "140",
                role: "customer",
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            expect(response.statusCode).toBe(201);
        });

        it("should return the user data", async () => {
            const userData = {
                firstName: "Nexelcc",
                lastName: "Chaurasiya",
                email: "neelcxc@gmail.com",
                password: "iloveneha",
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Role.Customer,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: "customer",
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(userData);

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });

        it("should return the status 401 when token not exist", async () => {
            const userData = {
                firstName: "Nexelcc",
                lastName: "Chaurasiya",
                email: "neelcxc@gmail.com",
                password: "iloveneha",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Role.Customer });

            const response = await request(app)
                .get("/auth/self")
                .send(userData);

            expect(response.statusCode).toBe(401);
        });
    });
});
