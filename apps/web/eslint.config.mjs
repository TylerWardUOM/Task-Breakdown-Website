import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["packages/**/*.{js,ts,tsx}"], // Lint all JS/TS files in packages/
    rules: {
      "no-console": "warn", // Example: Customize rules for packages
    },
  },
];

export default eslintConfig;
