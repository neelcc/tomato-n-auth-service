import { config } from "dotenv";
import path from "path";

// Load environment file based on NODE_ENV
config({
    path: path.join(process.cwd(), `.env.${process.env.NODE_ENV || "dev"}`),
});

function required(value: string | undefined, name: string): string {
    if (!value) {
        console.log(name);

        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const Config = {
    PORT: Number(required(process.env.PORT, "PORT")),
    NODE_ENV: required(process.env.NODE_ENV, "NODE_ENV"),

    DB_HOST: required(process.env.DB_HOST, "DB_HOST"),
    DB_PORT: Number(required(process.env.DB_PORT, "DB_PORT")),
    DB_USERNAME: required(process.env.DB_USERNAME, "DB_USERNAME"),
    DB_PASSWORD: required(process.env.DB_PASSWORD, "DB_PASSWORD"),
    DB_NAME: required(process.env.DB_NAME, "DB_NAME"),
    REFRESH_TOKEN_SECRET: required(
        process.env.REFRESH_TOKEN_SECRET,
        "REFRESH_TOKEN_SECRET",
    ),
    JWKS_URI: required(process.env.JWKS_URI, "JWKS_URI"),
    PRIVATE_KEY: required(process.env.PRIVATE_KEY, "PRIVATE_KEY"),
} as const;
