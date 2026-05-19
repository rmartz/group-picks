export function parseDueDateField(
  value: unknown,
): { date: Date | undefined } | { error: string } {
  if (value === undefined || value === null || value === "") {
    return { date: undefined };
  }
  if (typeof value !== "string") {
    return { date: undefined };
  }
  const parsed = new Date(value);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    return { error: "dueDate is invalid" };
  }
  return { date: parsed };
}
