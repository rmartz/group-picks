"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/services/categories";
import { CreateCategoryFormView } from "./CreateCategoryFormView";
import { CREATE_CATEGORY_COPY } from "./copy";

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
      await createCategory(groupId, name, description || undefined);
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
