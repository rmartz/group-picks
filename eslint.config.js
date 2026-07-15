import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/.claude/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/next-env.d.ts",
      ".storybook/**",
      "storybook-static/**",
      "vitest.config.mts",
      "src/components/ui/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  // File-length cap — enforced by eslint's max-lines, replacing the bespoke
  // file-length CI job + check-file-length.sh. Caps: 400 for source, 600 for
  // tests (2× the ~200/~300 AGENTS.md guidance). ESLint fails at > max, so
  // files at exactly 400/600 lines pass (the old >= check would have failed
  // them — intentional 1-line relaxation; no files are within that margin).
  // Counts every line (blanks + comments) so the cap can't be padded out.
  {
    files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
    rules: {
      "max-lines": [
        "error",
        { max: 400, skipBlankLines: false, skipComments: false },
      ],
    },
  },
  // Test files get the higher 600 cap (last-match-wins over the 400 above).
  {
    files: [
      "**/*.spec.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "**/*-tests/**/*.{ts,tsx}",
    ],
    rules: {
      "max-lines": [
        "error",
        { max: 600, skipBlankLines: false, skipComments: false },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  // Static enforcement of prose code-style conventions (AGENTS.md): type-only
  // imports go through `import type`; no inline `import("…").Type`; no IIFEs;
  // async/await over `.then()`; and the Vitest conventions (`it()` not `test()`,
  // no `.toBeInTheDocument()`). Rules the review process used to enforce by eye.
  {
    files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSImportType",
          message:
            'No inline import("…").Type — use a module-level `import type { … } from "…"`.',
        },
        {
          selector: "CallExpression > FunctionExpression.callee",
          message:
            "No IIFEs — extract a named helper or compute the value with a plain expression.",
        },
        {
          selector: "CallExpression > ArrowFunctionExpression.callee",
          message:
            "No IIFEs — extract a named helper or compute the value with a plain expression.",
        },
        {
          selector: "CallExpression[callee.property.name='then']",
          message: "Use async/await, not a .then() chain.",
        },
        {
          selector:
            "CallExpression[callee.name='test'][callee.type='Identifier']",
          message: "Use it() from Vitest, not test().",
        },
        {
          selector: "MemberExpression[property.name='toBeInTheDocument']",
          message:
            "Don't use .toBeInTheDocument() — use .toBeDefined() or check .textContent.",
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // Root-level framework config files (Sentry, Next.js) use SDK types that don't
  // resolve cleanly under strictTypeChecked — relax unsafe-call/member rules
  {
    files: ["sentry.*.config.ts", "instrumentation.ts", "next.config.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
  // Test files use Response.json() which inherently returns `any`; relax unsafe rules
  {
    files: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  // Storybook stories use loose patterns; skip strict type checking
  {
    files: ["src/**/*.stories.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
);
