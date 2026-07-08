export interface UnpinnedAction {
  line: number;
  uses: string;
  reason: string;
}

export declare function findUnpinnedActions(content: string): UnpinnedAction[];
