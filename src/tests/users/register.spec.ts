import "reflect-metadata";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import app from "../../app.js";
import { User } from "../../entity/User.js";
import { Roles } from "../../constants/index.js";
import { isJwt } from "./utils/index.js";
import { RefreshToken } from "../../entity/RefreshToken.js";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database Truncate
        await connection.dropDatabase();
        await connection.synchronize(true);
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

            const repository = connection.getRepository(User);
            const users = await repository.find();
            console.log("g");

            expect(response.body).toHaveProperty("id");
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

            expect(users[0]?.role).toBe(Roles.Customer);
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
            const users = await repository.find({ select: ["password"] });

            expect(users[0]?.password).not.toBe(userData.password);
            expect(users[0]?.password).toHaveLength(60);
        });

        it("should return the access and refresh token inside a cookie ", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            interface Headers {
                ["set-cookie"]?: string[];
            }

            const cookies = (response.headers as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0]?.split("=")[1];
                }

                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0]?.split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it("should store the refresh token in db", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                email: "neelcc@gmail.com",
                password: "iloveneha",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const refreshTokenRepo = connection.getRepository(RefreshToken);
            // const refreshTokens = await refreshTokenRepo.find();

            // expect(refreshTokens).toHaveLength(1);

            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId= :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });

        // it.todo(
        //     "should return 400 status code if email is already exists",
        //     async () => {
        //         // Arange
        //         const userData = {
        //             firstName: "Neelcc",
        //             lastName: "Chaurasiya",
        //             email: "neelcc@gmail.com",
        //             password: "iloveneha",
        //         };

        //         // Act

        //         const response = await request(app)
        //             .post("/auth/register")
        //             .send(userData);

        //         expect(response.body).toBe(400);
        //     },
        // );
    });

    describe("Fields are missing", () => {
        it("should if any field is missing return 400 ", async () => {
            const userData = {
                firstName: "Neelcc",
                lastName: "Chaurasiya",
                password: "iloveneha",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);
        });
    });
});
