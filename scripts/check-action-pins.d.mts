export interface UnpinnedAction {
  line: number;
  uses: string;
}

export declare function findUnpinnedActions(content: string): UnpinnedAction[];
