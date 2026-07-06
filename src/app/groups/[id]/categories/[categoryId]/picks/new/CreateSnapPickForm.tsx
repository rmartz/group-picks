"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSnapPick } from "@/services/snap-picks";

import { CREATE_SNAP_PICK_COPY } from "./CreateSnapPickForm.copy";
import { CreateSnapPickFormView } from "./CreateSnapPickFormView";

interface CreateSnapPickFormProps {
  groupId: string;
  categoryId: string;
}

export function CreateSnapPickForm({
  groupId,
  categoryId,
}: CreateSnapPickFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError(CREATE_SNAP_PICK_COPY.errors.nameRequired);
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const { snapPickId } = await createSnapPick(
        groupId,
        categoryId,
        title.trim(),
      );
      router.push(
        `/groups/${groupId}/categories/${categoryId}/snap-picks/${snapPickId}`,
      );
    } catch {
      setError(CREATE_SNAP_PICK_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CreateSnapPickFormView
      title={title}
      onTitleChange={setTitle}
      onSubmit={(e) => void handleSubmit(e)}
      onCancel={() => {
        router.back();
      }}
      loading={loading}
      error={error}
    />
  );
}
