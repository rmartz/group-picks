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
