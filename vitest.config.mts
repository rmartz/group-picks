import { defineConfig } from "vitest/config";
import babel from "@rolldown/plugin-babel";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { readFileSync } from "node:fs";
import path from "path";

const ROUTE_FILE =
  /\/src\/app\/(?:.*\/)?(?:default|error|layout|loading|not-found|page|template)\.tsx$/;

// Next applies the compiler to the browser bundle only, so Server Components
// (App Router route files without "use client") ship uncompiled. Skip them
// here too: specs call async pages directly as functions, outside a render,
// where a compiled component's memo cache hook would throw.
function isClientModule(filename: string) {
  return (
    !ROUTE_FILE.test(filename) ||
    readFileSync(filename, "utf8").trimStart().startsWith('"use client"')
  );
}

// Run React code under test through the same React Compiler transform that
// `reactCompiler: true` applies in the Next.js build. @babel/core stays on 7.x:
// babel-plugin-react-compiler 1.0 bails on Babel 8's AST for destructured
// prop defaults, silently skipping those components (react/react#37406).
// The storybook project gets the transform from .storybook/main.ts.
const reactCompiler = babel({
  presets: [reactCompilerPreset({ sources: isClientModule })],
});

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.spec.ts"],
          exclude: ["src/hooks/**/*.spec.ts"],
        },
        resolve: {
          alias: { "@": path.resolve(import.meta.dirname, "./src") },
        },
      },
      {
        plugins: [reactCompiler],
        test: {
          name: "hooks",
          environment: "happy-dom",
          include: ["src/hooks/**/*.spec.ts"],
          setupFiles: ["./src/test-setup/base-ui-animations.ts"],
        },
        resolve: {
          alias: { "@": path.resolve(import.meta.dirname, "./src") },
        },
      },
      {
        plugins: [reactCompiler],
        test: {
          name: "components",
          environment: "happy-dom",
          include: ["src/**/*.spec.tsx"],
          setupFiles: ["./src/test-setup/base-ui-animations.ts"],
        },
        resolve: {
          alias: { "@": path.resolve(import.meta.dirname, "./src") },
        },
      },
      {
        plugins: [storybookTest()],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["@storybook/addon-vitest/internal/setup-file"],
        },
      },
    ],
  },
});
