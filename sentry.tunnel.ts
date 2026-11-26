// Same-origin route that proxies browser Sentry events through the Next.js
// server, so ad-blockers don't drop them. The browser SDK sends to it
// (`tunnel`) and the server SDK answers it (`serveTunnelIntegration`).
export const SENTRY_TUNNEL_PATH = "/monitoring";
