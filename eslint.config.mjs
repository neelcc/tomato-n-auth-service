// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        ignores: ["dist/**", "node_modules/**", "eslint.config.mjs", "src/scripts/generateKeys.mjs"  ],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            "dot-notation": "error",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
        },
    },
);
