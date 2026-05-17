"use client";

import { useState } from "react";

import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";
import { createCategory, updateCategory } from "@/services/categories";

import { CategoryListView } from "./CategoryListView";
import { CATEGORY_COPY } from "./copy";

interface CategoryListProps {
  groupId: string;
  initialCategories: Category[];
  currentUserId: string;
  initialPicksByCategory: Record<string, GroupPick[]>;
}

export function CategoryList({
  groupId,
  initialCategories,
  currentUserId,
  initialPicksByCategory,
}: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? "");
    setError(undefined);
    setShowCreateForm(false);
  }

  function cancelEdit() {
    setEditingId(undefined);
    setError(undefined);
  }

  function startCreate() {
    setShowCreateForm(true);
    setCreateName("");
    setCreateDescription("");
    setError(undefined);
    setEditingId(undefined);
  }

  function cancelCreate() {
    setShowCreateForm(false);
    setError(undefined);
  }

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const { categoryId, creatorId, createdAt } = await createCategory(
        groupId,
        createName.trim(),
        createDescription.trim(),
      );
      const newCategory: Category = {
        id: categoryId,
        groupId,
        name: createName.trim(),
        description: createDescription.trim(),
        createdAt,
        creatorId,
      };
      setCategories((prev) => [...prev, newCategory]);
      setShowCreateForm(false);
      setCreateName("");
      setCreateDescription("");
    } catch {
      setError(CATEGORY_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(undefined);
    setLoading(true);
    try {
      await updateCategory(
        groupId,
        editingId,
        editName.trim(),
        editDescription.trim(),
      );
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: editName.trim(),
                description: editDescription.trim(),
              }
            : c,
        ),
      );
      setEditingId(undefined);
    } catch {
      setError(CATEGORY_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CategoryListView
      categories={categories}
      groupId={groupId}
      currentUserId={currentUserId}
      showCreateForm={showCreateForm}
      editingId={editingId}
      createName={createName}
      createDescription={createDescription}
      editName={editName}
      editDescription={editDescription}
      loading={loading}
      error={error}
      picksByCategory={initialPicksByCategory}
      onStartCreate={startCreate}
      onCancelCreate={cancelCreate}
      onStartEdit={startEdit}
      onCancelEdit={cancelEdit}
      onCreateNameChange={setCreateName}
      onCreateDescriptionChange={setCreateDescription}
      onEditNameChange={setEditName}
      onEditDescriptionChange={setEditDescription}
      onCreateSubmit={(e) => void handleCreate(e)}
      onEditSubmit={(e) => void handleEdit(e)}
    />
  );
}
