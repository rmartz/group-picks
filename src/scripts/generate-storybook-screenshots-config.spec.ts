import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

const SCRIPT_PATH = join(
  process.cwd(),
  "scripts",
  "generate-storybook-screenshots-config.mjs",
);

interface GenerateScreenshotsConfigResult {
  githubOutput: string;
  output: string;
  status: number | null;
}

function runGenerateScreenshotsConfig(options: {
  changedFiles: string[];
  files: Record<string, string>;
  withGithubOutput?: boolean;
}): GenerateScreenshotsConfigResult {
  const tempRoot = mkdtempSync(join(tmpdir(), "storybook-screenshots-"));
  const changedFilesPath = join(tempRoot, "changed-files.txt");
  const githubOutputPath = join(tempRoot, "github-output.txt");

  try {
    for (const [relativePath, content] of Object.entries(options.files)) {
      const absolutePath = join(tempRoot, relativePath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, content);
    }

    writeFileSync(changedFilesPath, `${options.changedFiles.join("\n")}\n`);

    const result = spawnSync(
      "node",
      [
        SCRIPT_PATH,
        "--changed-files=changed-files.txt",
        "--output=.github/screenshots.dynamic.yml",
        ...(options.withGithubOutput
          ? [`--github-output=${githubOutputPath}`]
          : []),
      ],
      {
        cwd: tempRoot,
        encoding: "utf8",
      },
    );

    const output = readFileSync(
      join(tempRoot, ".github", "screenshots.dynamic.yml"),
      "utf8",
    );

    return {
      githubOutput: options.withGithubOutput
        ? readFileSync(githubOutputPath, "utf8")
        : "",
      output,
      status: result.status,
    };
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

describe("generate-storybook-screenshots-config script", () => {
  it("includes all stories when a component file changes", () => {
    const result = runGenerateScreenshotsConfig({
      changedFiles: ["src/components/ui/bar.tsx"],
      files: {
        "src/components/ui/bar.stories.tsx": `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/UI/Bar",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLabel: Story = {};
`,
        "src/components/ui/bar.tsx": "export const Bar = () => null;\n",
      },
    });

    expect(result.status).toBe(0);
    expect(result.output).toContain('name: "components-ui-bar--default"');
    expect(result.output).toContain('name: "components-ui-bar--with-label"');
    expect(result.output).not.toContain('name: "bar-default"');
    expect(result.output).not.toContain('name: "bar-with-label"');
    expect(result.output).toContain(
      "http://127.0.0.1:6006/?path=/story/components-ui-bar--default",
    );
    expect(result.output).toContain(
      "http://127.0.0.1:6006/?path=/story/components-ui-bar--with-label",
    );
  });

  it("uses meta id when provided and component story file is changed directly", () => {
    const result = runGenerateScreenshotsConfig({
      changedFiles: ["src/components/profile/UserProfileView.stories.tsx"],
      files: {
        "src/components/profile/UserProfileView.stories.tsx": `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  id: "profile-user-profile-view",
  title: "Profile/UserProfileView",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
`,
      },
    });

    expect(result.status).toBe(0);
    expect(result.output).toContain(
      'name: "profile-user-profile-view--populated"',
    );
    expect(result.output).toContain(
      "http://127.0.0.1:6006/?path=/story/profile-user-profile-view--populated",
    );
  });

  it("respects includeStories and excludeStories when collecting story exports", () => {
    const result = runGenerateScreenshotsConfig({
      changedFiles: ["src/components/ui/bar.tsx"],
      files: {
        "src/components/ui/bar.stories.tsx": `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/UI/Bar",
  includeStories: ["Default", "WithLabel"],
  excludeStories: ["WithLabel"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLabel: Story = {};
export const helper = () => {};
`,
        "src/components/ui/bar.tsx": "export const Bar = () => null;\n",
      },
    });

    expect(result.status).toBe(0);
    expect(result.output).toContain(
      "http://127.0.0.1:6006/?path=/story/components-ui-bar--default",
    );
    expect(result.output).not.toContain(
      "http://127.0.0.1:6006/?path=/story/components-ui-bar--with-label",
    );
    expect(result.output).not.toContain(
      "http://127.0.0.1:6006/?path=/story/components-ui-bar--helper",
    );
  });

  it("writes an empty screenshots list when no mapped stories exist", () => {
    const result = runGenerateScreenshotsConfig({
      changedFiles: ["README.md"],
      files: {},
    });

    expect(result.status).toBe(0);
    expect(result.output.trim()).toBe("version: 1\nscreenshots: []");
  });

  it("writes GitHub outputs when no stories are mapped", () => {
    const result = runGenerateScreenshotsConfig({
      changedFiles: ["README.md"],
      files: {},
      withGithubOutput: true,
    });

    expect(result.status).toBe(0);
    expect(result.githubOutput).toContain("story_count=0");
    expect(result.githubOutput).toContain("has_stories=false");
  });

  it("writes GitHub outputs when stories are mapped", () => {
    const result = runGenerateScreenshotsConfig({
      changedFiles: ["src/components/ui/bar.tsx"],
      files: {
        "src/components/ui/bar.stories.tsx": `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/UI/Bar",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLabel: Story = {};
`,
        "src/components/ui/bar.tsx": "export const Bar = () => null;\n",
      },
      withGithubOutput: true,
    });

    expect(result.status).toBe(0);
    expect(result.githubOutput).toContain("story_count=2");
    expect(result.githubOutput).toContain("has_stories=true");
  });
});
