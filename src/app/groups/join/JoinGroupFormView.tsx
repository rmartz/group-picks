import { Button } from "@/components/ui/button";

import { JOIN_GROUP_COPY } from "./copy";

interface JoinGroupFormViewProps {
  groupName: string;
  memberCount?: number;
  onJoin: () => void;
  isJoining: boolean;
  isSigningIn: boolean;
  error: string | undefined;
  onSignInDifferentAccount: () => void;
}

export function JoinGroupFormView({
  groupName,
  memberCount,
  onJoin,
  isJoining,
  isSigningIn,
  error,
  onSignInDifferentAccount,
}: JoinGroupFormViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{JOIN_GROUP_COPY.joinTitle}</h1>
      <div className="rounded-lg border p-4 space-y-1">
        <p className="font-medium">{groupName}</p>
        {memberCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            {memberCount}{" "}
            {memberCount === 1
              ? JOIN_GROUP_COPY.memberSingular
              : JOIN_GROUP_COPY.memberPlural}
          </p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-3">
        <Button
          type="button"
          onClick={onJoin}
          disabled={isJoining || isSigningIn}
          className="w-full"
        >
          {isJoining
            ? JOIN_GROUP_COPY.joiningButton
            : JOIN_GROUP_COPY.joinButton}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <button
            type="button"
            onClick={onSignInDifferentAccount}
            disabled={isJoining || isSigningIn}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {JOIN_GROUP_COPY.signInDifferentAccount}
          </button>
        </p>
      </div>
    </main>
  );
}
