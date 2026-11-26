import * as Sentry from "@sentry/nextjs";

import { sentryDataCollection } from "./sentry.data-collection";
import { SENTRY_TUNNEL_PATH } from "./sentry.tunnel";

Sentry.init({
  dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"],

  // Sends IP addresses, cookies, and request headers. Off by default; opt in via
  // SENTRY_ENABLE_SENSITIVE_DATA=true (development only).
  dataCollection: sentryDataCollection(
    process.env.NODE_ENV === "development" &&
      process.env["NEXT_PUBLIC_SENTRY_ENABLE_SENSITIVE_DATA"] === "true",
  ),
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Send events through the server's tunnel route to bypass ad-blockers
  tunnel: { path: SENTRY_TUNNEL_PATH },
});
