import "reflect-metadata";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import app from "../../app.js";
import { User } from "../../entity/User.js";
import { Role } from "../../constants/index.js";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database Truncate
        await connection.dropDatabase();
        await connection.synchronize();
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

        it("it should return the id of user", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.body).toHaveProperty("id");
            const repository = connection.getRepository(User);
            const users = await repository.find();

            expect((response.body as Record<string, string>).id).toBe(
                users[0]?.id,
            );
        });

        it("should assign a user role", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.body).toHaveProperty("role");

            const repository = connection.getRepository(User);
            const users = await repository.find();
            console.log("--", users);

            expect(users[0]?.role).toBe(Role.Customer);
        });

        it("should check whether password is hashed or not", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
            };

            await request(app).post("/auth/register").send(userData);

            const repository = connection.getRepository(User);
            const users = await repository.find();

            expect(users[0]?.password).not.toBe(userData.password);
            expect(users[0]?.password).toHaveLength(60);
        });

        it.todo(
            "should return 400 status code if email is already exists",
            async () => {
                // Arange
                const userData = {
                    firstName: "Neelcc",
                    lastName: "Chaurasiya",
                    email: "neelcc@gmail.com",
                    password: "iloveneha",
                };

                // Act

                const response = await request(app)
                    .post("/auth/register")
                    .send(userData);

                expect(response.body).toBe(400);
            },
        );
    });

    // describe("Fields are missing",()=>{

    //     })
});
