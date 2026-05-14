"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPick } from "@/services/picks";
import { CreatePickFormView } from "./CreatePickFormView";
import { CREATE_PICK_COPY } from "./copy";

interface CreatePickFormProps {
  groupId: string;
  categoryId: string;
  hasPriorPicks: boolean;
}

export function CreatePickForm({
  groupId,
  categoryId,
  hasPriorPicks,
}: CreatePickFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [topCount, setTopCount] = useState(3);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const { pickId } = await createPick(
        groupId,
        categoryId,
        title.trim(),
        topCount,
        dueDate || undefined,
      );
      router.push(
        `/groups/${groupId}/categories/${categoryId}/picks/${pickId}`,
      );
    } catch {
      setError(CREATE_PICK_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CreatePickFormView
      title={title}
      onTitleChange={setTitle}
      topCount={topCount}
      onTopCountChange={setTopCount}
      dueDate={dueDate}
      onDueDateChange={setDueDate}
      hasPriorPicks={hasPriorPicks}
      onSubmit={(e) => void handleSubmit(e)}
      onCancel={() => {
        router.back();
      }}
      loading={loading}
      error={error}
    />
  );
}
