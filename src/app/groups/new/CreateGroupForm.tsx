"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DEFAULT_GROUP_EMOJI } from "@/lib/types/group";
import { createGroup } from "@/services/groups";

import { CREATE_GROUP_COPY } from "./copy";
import { CreateGroupFormView } from "./CreateGroupFormView";

export function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(DEFAULT_GROUP_EMOJI);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const groupId = await createGroup(name, emoji);
      router.push(`/groups/${groupId}`);
    } catch {
      setError(CREATE_GROUP_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CreateGroupFormView
      name={name}
      emoji={emoji}
      onNameChange={setName}
      onEmojiChange={setEmoji}
      onSubmit={(e) => void handleSubmit(e)}
      onCancel={() => {
        router.back();
      }}
      loading={loading}
      error={error}
    />
  );
}
