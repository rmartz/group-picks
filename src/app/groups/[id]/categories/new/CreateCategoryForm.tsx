"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createCategory } from "@/services/categories";

import { CREATE_CATEGORY_COPY } from "./copy";
import { CreateCategoryFormView } from "./CreateCategoryFormView";

interface CreateCategoryFormProps {
  groupId: string;
}

export function CreateCategoryForm({ groupId }: CreateCategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      await createCategory(groupId, name, description);
      router.push(`/groups/${groupId}`);
    } catch {
      setError(CREATE_CATEGORY_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CreateCategoryFormView
      name={name}
      onNameChange={setName}
      description={description}
      onDescriptionChange={setDescription}
      onSubmit={(e) => void handleSubmit(e)}
      loading={loading}
      error={error}
    />
  );
}
