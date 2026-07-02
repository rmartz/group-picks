export interface SnapPick {
  id: string;
  title: string;
  categoryId: string;
  createdAt: Date;
  creatorId: string;
  defaultDurationMs: number;
}

export interface SnapPickOption {
  id: string;
  title: string;
  addedBy: string;
  addedAt: Date;
  removedAt?: Date;
}

export interface SnapPickActivation {
  id: string;
  snapPickId: string;
  startedAt: Date;
  closesAt: Date;
  closedAt?: Date;
  winnerId?: string;
  startedBy: string;
}

// A single head-to-head matchup result recorded during an activation. Votes are
// stored under snap-pick-votes/{activationId}/{voteId} and are the source the
// winner is computed from at close time. The head-to-head voting UI (#259) is
// what writes these; the activation lifecycle (#258) only reads and tallies them.
export interface SnapPickVote {
  id: string;
  winnerId: string;
  loserId: string;
  votedBy: string;
  votedAt: Date;
}
