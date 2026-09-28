// Sentry v11 replaced `sendDefaultPii` with `dataCollection`, and flipped the
// default: leaving it unset now collects user info, cookies, headers, bodies,
// etc. This preserves the v10 `sendDefaultPii: false` behavior (per the Sentry
// v10 -> v11 migration guide) unless sensitive data is explicitly opted into.
const piiHeaderDenylist = ["forwarded", "-ip", "remote-", "via", "-user"];

const restrictiveDataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: piiHeaderDenylist },
    response: { deny: piiHeaderDenylist },
  },
  httpBodies: [],
  urlQueryParams: { deny: piiHeaderDenylist },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
};

// Returns `undefined` when sensitive data is enabled, which in v11 is the
// equivalent of the old `sendDefaultPii: true`.
export function sentryDataCollection(enableSensitiveData: boolean) {
  return enableSensitiveData ? undefined : restrictiveDataCollection;
}
