"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Group } from "@/lib/types/group";

import { GROUP_DETAIL_COPY } from "./copy";

interface MemberName {
  uid: string;
  name: string;
}

export interface MemberRowProps {
  member: MemberName;
  group: Group;
  isCurrentUser: boolean;
  isCallerAdmin: boolean;
  isCallerCreator: boolean;
  onMakeAdmin?: (uid: string) => void;
  onRevokeAdmin?: (uid: string) => void;
  onRemoveClick: (uid: string) => void;
}

export function MemberRow({
  member,
  group,
  isCurrentUser,
  isCallerAdmin,
  isCallerCreator,
  onMakeAdmin,
  onRevokeAdmin,
  onRemoveClick,
}: MemberRowProps) {
  const isMemberAdmin = group.adminIds.includes(member.uid);
  const isMemberCreator = group.creatorId === member.uid;
  const showMenu = isCallerAdmin && !isCurrentUser && !isMemberCreator;

  return (
    <li className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span>{member.name}</span>
        {isMemberCreator && (
          <Badge variant="default" className="text-xs">
            {GROUP_DETAIL_COPY.creatorChip}
          </Badge>
        )}
        {isMemberAdmin && !isMemberCreator && (
          <Badge variant="secondary" className="text-xs">
            {GROUP_DETAIL_COPY.adminChip}
          </Badge>
        )}
      </div>
      {showMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={GROUP_DETAIL_COPY.memberActionsLabel}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md p-0 text-sm hover:bg-accent"
            data-testid="member-menu-trigger"
          >
            ···
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isCallerCreator &&
              (isMemberAdmin ? (
                <DropdownMenuItem onClick={() => onRevokeAdmin?.(member.uid)}>
                  {GROUP_DETAIL_COPY.revokeAdminAction}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onMakeAdmin?.(member.uid)}>
                  {GROUP_DETAIL_COPY.makeAdminAction}
                </DropdownMenuItem>
              ))}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                onRemoveClick(member.uid);
              }}
            >
              {GROUP_DETAIL_COPY.removeAction}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}
