export const LOCKED_TOP_PICKS_COPY = {
  adminNote:
    "Admins can close early — once everyone has ranked, or to lock results in.",
  closesPrefix: "closes",
  dueNow: "closing now",
  explanation:
    "Top picks are calculated once, after everyone has ranked. Hiding live results also keeps later voters from being swayed.",
  lockIcon: "🔒",
  noDueDate: "Close date not set yet.",
  progressConnector: "of",
  progressSuffix: "members ranked",
  remainingSuffix: "left",
  title: "revealed when the pick closes",
  units: {
    day: "day",
    days: "days",
    hour: "hour",
    hours: "hours",
    minute: "minute",
    minutes: "minutes",
  },
} as const;
