import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./index.js";
import { User } from "../entity/User.js";
import { Tenant } from "../entity/Tenant.js";
import { RefreshToken } from "../entity/RefreshToken.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Config.DB_PORT,
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    // For prod turn this false
    synchronize: false,
    logging: false,
    entities: [User, Tenant, RefreshToken],
    migrations: ["dist/migrations/**/*.{ts,js}"],
    subscribers: [],
});
