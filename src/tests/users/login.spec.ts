import "reflect-metadata";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";

describe("POST /auth/login", () => {
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
        it.todo("", () => {});

        //         // Act

        //         const response = await request(app)
        //             .post("/auth/register")
        //             .send(userData);

        //         expect(response.body).toBe(400);
        //     },
        // );
    });
});
