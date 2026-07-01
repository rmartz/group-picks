export interface CaptureArgs {
  staticDir: string;
  out: string;
  changedFiles?: string;
}

export declare function parseArgs(argv: string[]): CaptureArgs;

export interface StoryEntry {
  id: string;
  type: string;
  importPath: string;
}

export interface StorybookIndex {
  entries: Record<string, StoryEntry>;
}

export declare function storiesFromIndex(index: StorybookIndex): StoryEntry[];

export declare function filterStoriesByChangedFiles(
  stories: StoryEntry[],
  changedFiles: string[],
): StoryEntry[];

export declare function parseChangedFiles(contents: string): string[];
