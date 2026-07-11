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

// A Snap Pick together with one of its currently-running activations. Surfaced
// on the group activity view so members can jump straight into an open vote.
export interface ActiveSnapPickActivation {
  snapPick: SnapPick;
  activation: SnapPickActivation;
}

// A resolved entry in a snap pick's history timeline: one past (closed)
// activation with its winning option's title and how many members voted. The
// winner title is resolved from the option pool at read time (options are
// soft-deleted, so a historical winner stays nameable); winnerTitle is absent
// when the run closed with no recorded winner (a tie or no votes).
export interface SnapPickHistoryEntry {
  activationId: string;
  closedAt: Date;
  winnerTitle?: string;
  participantCount: number;
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
  // Deterministic key of the unordered {winnerId, loserId} pair (see
  // snap-pick-pairing.pairKey). Identifies which matchup this vote decided so a
  // member's cast pairs can be deduped and their remaining queue resumed.
  pairKey: string;
}
