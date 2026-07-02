export const NEW_PICK_TYPES = ["standard", "snap"] as const;
export type NewPickType = (typeof NEW_PICK_TYPES)[number];
