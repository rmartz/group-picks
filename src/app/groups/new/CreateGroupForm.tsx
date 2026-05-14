"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/services/groups";
import { CreateGroupFormView } from "./CreateGroupFormView";
import { CREATE_GROUP_COPY } from "./copy";

export function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const groupId = await createGroup(name);
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
      onNameChange={setName}
      onSubmit={(e) => void handleSubmit(e)}
      onCancel={() => { router.back(); }}
      loading={loading}
      error={error}
    />
  );
}
