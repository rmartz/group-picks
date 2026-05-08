"use client";

import { useState } from "react";
import type { GroupPick } from "@/lib/types/pick";
import { updatePick } from "@/services/picks";
import { ReopenPickButton } from "./ReopenPickButton";
import { CATEGORY_DETAIL_COPY } from "./copy";

interface PickListProps {
  groupId: string;
  categoryId: string;
  initialPicks: GroupPick[];
}

function toDateTimeLocalValue(value: Date | undefined): string {
  if (!value) return "";

  const offsetMs = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toDisplayDueDate(value: Date | undefined): string {
  if (!value) return CATEGORY_DETAIL_COPY.metadata.noDueDateLabel;
  return value.toLocaleDateString();
}

export function PickList({ groupId, categoryId, initialPicks }: PickListProps) {
  const [picks, setPicks] = useState<GroupPick[]>(initialPicks);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTopCount, setEditTopCount] = useState("1");
  const [editDueDate, setEditDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function startEdit(pick: GroupPick) {
    setEditingId(pick.id);
    setEditTitle(pick.title);
    setEditDescription(pick.description ?? "");
    setEditTopCount(String(pick.topCount));
    setEditDueDate(toDateTimeLocalValue(pick.dueDate));
    setError(undefined);
  }

  function cancelEdit() {
    setEditingId(undefined);
    setError(undefined);
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!editingId) return;

    const parsedTopCount = Number.parseInt(editTopCount, 10);
    if (!Number.isInteger(parsedTopCount) || parsedTopCount < 1) {
      setError(CATEGORY_DETAIL_COPY.errors.default);
      return;
    }

    const dueDate = editDueDate ? new Date(editDueDate) : undefined;
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      setError(CATEGORY_DETAIL_COPY.errors.default);
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      await updatePick(
        groupId,
        categoryId,
        editingId,
        editTitle.trim(),
        editDescription.trim(),
        parsedTopCount,
        dueDate,
      );

      setPicks((prev) =>
        prev.map((pick) =>
          pick.id === editingId
            ? {
                ...pick,
                title: editTitle.trim(),
                description: editDescription.trim(),
                topCount: parsedTopCount,
                dueDate,
              }
            : pick,
        ),
      );
      setEditingId(undefined);
    } catch {
      setError(CATEGORY_DETAIL_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  return picks.length === 0 ? (
    <p className="text-sm text-muted-foreground">
      {CATEGORY_DETAIL_COPY.noPicksMessage}
    </p>
  ) : (
    <ul className="space-y-2">
      {picks.map((pick) => (
        <li key={pick.id} className="rounded-md border p-3 text-sm">
          {editingId === pick.id ? (
            <form
              aria-label={CATEGORY_DETAIL_COPY.editForm.title}
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label htmlFor="edit-pick-name" className="text-sm font-medium">
                  {CATEGORY_DETAIL_COPY.editForm.nameLabel}
                </label>
                <input
                  id="edit-pick-name"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                  }}
                  placeholder={CATEGORY_DETAIL_COPY.editForm.namePlaceholder}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="edit-pick-description"
                  className="text-sm font-medium"
                >
                  {CATEGORY_DETAIL_COPY.editForm.descriptionLabel}
                </label>
                <textarea
                  id="edit-pick-description"
                  value={editDescription}
                  onChange={(e) => {
                    setEditDescription(e.target.value);
                  }}
                  placeholder={
                    CATEGORY_DETAIL_COPY.editForm.descriptionPlaceholder
                  }
                  rows={3}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="edit-pick-top-count"
                  className="text-sm font-medium"
                >
                  {CATEGORY_DETAIL_COPY.editForm.topCountLabel}
                </label>
                <input
                  id="edit-pick-top-count"
                  type="number"
                  min={1}
                  required
                  value={editTopCount}
                  onChange={(e) => {
                    setEditTopCount(e.target.value);
                  }}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="edit-pick-due-date"
                  className="text-sm font-medium"
                >
                  {CATEGORY_DETAIL_COPY.editForm.dueDateLabel}
                </label>
                <input
                  id="edit-pick-due-date"
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => {
                    setEditDueDate(e.target.value);
                  }}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {CATEGORY_DETAIL_COPY.editForm.submitButton}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="rounded border px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {CATEGORY_DETAIL_COPY.editForm.cancelButton}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{pick.title}</p>
                    {pick.closedAt !== undefined && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {CATEGORY_DETAIL_COPY.closedBadge}
                      </span>
                    )}
                  </div>
                  {pick.description?.trim() && (
                    <p className="text-muted-foreground">{pick.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    startEdit(pick);
                  }}
                  disabled={loading}
                  className="shrink-0 rounded border px-3 py-1 text-sm font-medium disabled:opacity-50"
                >
                  {CATEGORY_DETAIL_COPY.editButton}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {CATEGORY_DETAIL_COPY.metadata.topCountLabel}: {pick.topCount} ·{" "}
                {CATEGORY_DETAIL_COPY.metadata.dueDateLabel}:{" "}
                {toDisplayDueDate(pick.dueDate)}
              </p>
              {pick.closedAt !== undefined && (
                <div className="mt-2">
                  <ReopenPickButton
                    groupId={groupId}
                    categoryId={categoryId}
                    pickId={pick.id}
                  />
                </div>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
