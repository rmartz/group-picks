import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { INVITE_LANDING_COPY } from "./copy";

interface CurrentPick {
  title: string;
  dueDate?: Date;
}

interface InviteLandingViewProps {
  groupName: string;
  groupEmoji: string;
  memberCount: number;
  memberNames: string[];
  currentPick?: CurrentPick;
  invitedByName?: string;
  // Unauthenticated: signInHref is provided (join = link to sign-in)
  signInHref?: string;
  // Authenticated: onJoin is provided (join = direct action)
  onJoin?: () => void;
  isJoining?: boolean;
  onSignInDifferentAccount?: () => void;
  error?: string;
}

export function InviteLandingView({
  groupName,
  groupEmoji,
  memberCount,
  memberNames,
  currentPick,
  invitedByName,
  signInHref,
  onJoin,
  isJoining = false,
  onSignInDifferentAccount,
  error,
}: InviteLandingViewProps) {
  const isAuthenticated = onJoin !== undefined;
  const memberLabel =
    memberCount === 1
      ? INVITE_LANDING_COPY.memberSingular
      : INVITE_LANDING_COPY.memberPlural;
  const memberSubtitle = invitedByName
    ? `${String(memberCount)} ${memberLabel} · ${INVITE_LANDING_COPY.invitedBy} ${invitedByName}`
    : `${String(memberCount)} ${memberLabel}`;

  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <p className="text-sm text-muted-foreground">
        {INVITE_LANDING_COPY.heading}
      </p>
      <div className="rounded-lg border p-4 space-y-1">
        <p className="font-semibold text-lg">
          <span aria-hidden="true">{groupEmoji}</span> {groupName}
        </p>
        <p className="text-sm text-muted-foreground">{memberSubtitle}</p>
      </div>

      {currentPick !== undefined && (
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {INVITE_LANDING_COPY.currentlyPickingHeading}
          </p>
          <div className="flex items-center gap-2">
            <p className="font-medium">{currentPick.title}</p>
            <Badge variant="secondary">{INVITE_LANDING_COPY.pickOpen}</Badge>
          </div>
          {currentPick.dueDate !== undefined && (
            <p className="text-xs text-muted-foreground">
              {INVITE_LANDING_COPY.duePrefix}
              {currentPick.dueDate.toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {memberNames.length > 0 && (
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {INVITE_LANDING_COPY.whoIsInHeading}
          </p>
          <p className="text-sm text-muted-foreground">
            {memberNames.join(", ")}
            {memberCount > memberNames.length &&
              `, +${String(memberCount - memberNames.length)}${INVITE_LANDING_COPY.memberOverflowSuffix}`}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-3">
        {isAuthenticated ? (
          <>
            <Button
              type="button"
              onClick={onJoin}
              disabled={isJoining}
              className="w-full"
            >
              {isJoining
                ? INVITE_LANDING_COPY.joiningButton
                : INVITE_LANDING_COPY.joinButton}
            </Button>
            {onSignInDifferentAccount !== undefined && (
              <p className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={onSignInDifferentAccount}
                  disabled={isJoining}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {INVITE_LANDING_COPY.signInDifferentAccount}
                </button>
              </p>
            )}
          </>
        ) : (
          <>
            <Button
              render={<Link href={signInHref ?? "/sign-in"} />}
              className="w-full"
            >
              {INVITE_LANDING_COPY.joinButton}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {INVITE_LANDING_COPY.accountCreationNote}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              <Link
                href={signInHref ?? "/sign-in"}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {INVITE_LANDING_COPY.alreadyMemberSignIn}
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
