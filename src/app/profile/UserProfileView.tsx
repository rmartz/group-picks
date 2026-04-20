"use client";

import { useState } from "react";
import { USER_PROFILE_COPY } from "./copy";

interface UserProfileViewProps {
  initialDisplayName: string;
  providerIds: string[];
  onSave: (displayName: string) => Promise<void>;
}

export function UserProfileView({
  initialDisplayName,
  providerIds,
  onSave,
}: UserProfileViewProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setSuccess(false);
    setLoading(true);
    try {
      await onSave(displayName);
      setSuccess(true);
    } catch {
      setError(USER_PROFILE_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  const providerLabels = USER_PROFILE_COPY.providers;

  return (
    <div className="w-full max-w-sm space-y-8">
      <h1 className="text-2xl font-semibold">{USER_PROFILE_COPY.title}</h1>
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label htmlFor="displayName" className="text-sm font-medium">
            {USER_PROFILE_COPY.displayNameLabel}
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setSuccess(false);
            }}
            placeholder={USER_PROFILE_COPY.displayNamePlaceholder}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">
            {USER_PROFILE_COPY.successMessage}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {USER_PROFILE_COPY.saveButton}
        </button>
      </form>
      <section className="space-y-2">
        <h2 className="text-sm font-medium">
          {USER_PROFILE_COPY.linkedAccountsTitle}
        </h2>
        <ul className="space-y-1">
          {providerIds.map((providerId) => (
            <li key={providerId} className="text-sm text-zinc-600">
              {(providerLabels as Record<string, string>)[providerId] ??
                providerId}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
