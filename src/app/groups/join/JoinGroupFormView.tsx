import { JOIN_GROUP_COPY } from "./copy";

interface JoinGroupFormViewProps {
  groupName: string;
  onJoin: () => void;
  loading: boolean;
  error: string | undefined;
}

export function JoinGroupFormView({
  groupName,
  onJoin,
  loading,
  error,
}: JoinGroupFormViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{JOIN_GROUP_COPY.joinTitle}</h1>
      <p className="text-sm text-gray-600">
        {JOIN_GROUP_COPY.joinPrompt}{" "}
        <span className="font-medium text-gray-900">{groupName}</span>.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={onJoin}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? JOIN_GROUP_COPY.joiningButton : JOIN_GROUP_COPY.joinButton}
      </button>
    </main>
  );
}
