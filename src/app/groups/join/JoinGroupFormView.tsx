import { Button } from "@/components/ui/button";
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
      <Button type="button" onClick={onJoin} disabled={loading}>
        {loading ? JOIN_GROUP_COPY.joiningButton : JOIN_GROUP_COPY.joinButton}
      </Button>
    </main>
  );
}
