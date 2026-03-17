// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "eslint.config.mjs",
            "src/scripts/generateKeys.mjs",
            "src/scripts/convertPemtoJwks.mjs",
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "dot-notation": "error",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
        },
    },
);
