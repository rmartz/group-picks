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

// One option's learned strength in a user's global preference model for a Snap
// Pick (see snap-pick-inference). `rating` is the Elo-style scalar — higher means
// the user broadly prefers this option across every past activation; `games` is
// how many votes have touched it, the uncertainty signal (0 = cold-start, no
// history, so the rating is the neutral default and carries no evidence yet).
export interface SnapPickRating {
  rating: number;
  games: number;
}

// A user's whole global preference model for one Snap Pick: one rating per
// option, keyed by optionId. Stored O(N) at snap-pick-preferences/{snapPickId}/
// {userId} — not the O(N²) pairwise matrix. Absent keys are cold-start (neutral).
export type SnapPickRatings = Record<string, SnapPickRating>;

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
