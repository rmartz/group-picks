export const PRIOR_PICK_BANNER_COPY = {
  heading: (categoryName: string) =>
    `start from your last ${categoryName} pick?`,
  rankedLabel: "ranked",
  overlapSuffix: "of those options are here too",
  prefillButton: "Pre-fill ranking",
  startFreshButton: "Start fresh",
  dismissLabel: "Dismiss",
} as const;
