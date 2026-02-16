import "reflect-metadata";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../config/data-source.js";
import { truncateTables } from "./utils/index.js";
import { User } from "../entity/User.js";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database Truncate
        await truncateTables(connection);
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe("Fields are not missing", () => {
        it("should persist the user in db ", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
            };

            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0]?.firstName).toBe(userData.firstName);
        });

        // describe("Fields are missing",()=>{

        // })
    });
});
