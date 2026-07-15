export declare const MARKER: string;

export declare function parseNextLink(
  linkHeader: string | null | undefined,
): string | undefined;

export interface MarkerComment {
  id: number;
  body?: string;
}

export interface FindMarkerCommentOptions {
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
  repo: string;
  pr: string;
  token: string;
  marker?: string;
}

export declare function findMarkerComment(
  options: FindMarkerCommentOptions,
): Promise<MarkerComment | undefined>;

export interface ScreenshotPair {
  file: string;
  name: string;
  hasBefore: boolean;
  hasAfter: boolean;
}

export declare function pairScreenshots(
  beforeFiles: string[],
  afterFiles: string[],
): ScreenshotPair[];

export declare function buildBody(
  repo: string,
  branch: string,
  sha: string,
  beforeFiles: string[],
  afterFiles: string[],
  beforeAvailable?: boolean,
): string;
