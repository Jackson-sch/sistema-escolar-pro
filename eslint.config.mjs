import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Carpetas de respaldo y herramientas locales (gitignored)
    ".trash/**",
    ".agent/**",
    ".antigravity/**",
  ]),
  {
    // This project is Spanish-only. No internationalization needed.
    rules: {
      "react/jsx-no-literals": "off",
      // El código usa `any` deliberadamente para datos serializados de Prisma.
      // Se mantiene como warning (no error) para no bloquear CI.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;

