export interface DependabotPr {
  number: number;
  title: string;
  state: string;
  statusCheckRollup: { conclusion?: string; state?: string }[];
}

export interface OtherPr {
  number: number;
  title: string;
  state: string;
  body: string;
  author: { login: string };
}

export interface GroupBucket {
  clean: number;
  "needed-fix": number;
  stuck: number;
  pending: number;
  churn: number;
}

export interface AuditRow {
  number: number;
  title: string;
  group: string;
  outcome: string;
  fixes: number[];
  mechanics: boolean;
}

export interface Report {
  rows: AuditRow[];
  groups: Map<string, GroupBucket>;
}

export declare function buildReport(
  dependabotPrs: DependabotPr[],
  otherPrs: OtherPr[],
  repo: string,
): Report;
