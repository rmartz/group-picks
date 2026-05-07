"use client";

import { useState } from "react";
import type { Category } from "@/lib/types/category";
import { createCategory, updateCategory } from "@/services/categories";
import { createPick } from "@/services/picks";
import { CategoryListView } from "./CategoryListView";
import { CATEGORY_COPY } from "./copy";

interface CategoryListProps {
  groupId: string;
  initialCategories: Category[];
}

export function CategoryList({
  groupId,
  initialCategories,
}: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [createPickCategoryId, setCreatePickCategoryId] = useState("");
  const [createPickName, setCreatePickName] = useState("");
  const [createPickDescription, setCreatePickDescription] = useState("");
  const [createPickTopCount, setCreatePickTopCount] = useState("3");
  const [createPickDueDate, setCreatePickDueDate] = useState("");
  const [showCreatePickForCategoryId, setShowCreatePickForCategoryId] =
    useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pickLoading, setPickLoading] = useState(false);
  const [pickError, setPickError] = useState<string | undefined>();

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? "");
    setError(undefined);
    setShowCreateForm(false);
    setShowCreatePickForCategoryId(undefined);
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
    setShowCreatePickForCategoryId(undefined);
  }

  function cancelCreate() {
    setShowCreateForm(false);
    setError(undefined);
  }

  function startCreatePick(categoryId: string) {
    setShowCreatePickForCategoryId(categoryId);
    setCreatePickCategoryId(categoryId);
    setCreatePickName("");
    setCreatePickDescription("");
    setCreatePickTopCount("3");
    setCreatePickDueDate("");
    setPickError(undefined);
    setShowCreateForm(false);
    setEditingId(undefined);
  }

  function cancelCreatePick() {
    setShowCreatePickForCategoryId(undefined);
    setPickError(undefined);
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

  async function handleCreatePick(e: React.SyntheticEvent) {
    e.preventDefault();
    setPickError(undefined);
    const topCount = Number.parseInt(createPickTopCount, 10);
    if (!Number.isInteger(topCount) || topCount < 1) {
      setPickError(CATEGORY_COPY.errors.default);
      return;
    }

    setPickLoading(true);
    try {
      await createPick(
        groupId,
        createPickCategoryId,
        createPickName.trim(),
        createPickDescription.trim(),
        topCount,
        createPickDueDate || undefined,
      );
      setShowCreatePickForCategoryId(undefined);
      setCreatePickName("");
      setCreatePickDescription("");
      setCreatePickTopCount("3");
      setCreatePickDueDate("");
    } catch {
      setPickError(CATEGORY_COPY.errors.default);
    } finally {
      setPickLoading(false);
    }
  }

  return (
    <CategoryListView
      categories={categories}
      showCreateForm={showCreateForm}
      editingId={editingId}
      createName={createName}
      createDescription={createDescription}
      editName={editName}
      editDescription={editDescription}
      loading={loading}
      error={error}
      showCreatePickForCategoryId={showCreatePickForCategoryId}
      createPickCategoryId={createPickCategoryId}
      createPickName={createPickName}
      createPickDescription={createPickDescription}
      createPickTopCount={createPickTopCount}
      createPickDueDate={createPickDueDate}
      pickLoading={pickLoading}
      pickError={pickError}
      onStartCreate={startCreate}
      onCancelCreate={cancelCreate}
      onStartCreatePick={startCreatePick}
      onCancelCreatePick={cancelCreatePick}
      onStartEdit={startEdit}
      onCancelEdit={cancelEdit}
      onCreateNameChange={setCreateName}
      onCreateDescriptionChange={setCreateDescription}
      onEditNameChange={setEditName}
      onEditDescriptionChange={setEditDescription}
      onCreatePickCategoryChange={setCreatePickCategoryId}
      onCreatePickNameChange={setCreatePickName}
      onCreatePickDescriptionChange={setCreatePickDescription}
      onCreatePickTopCountChange={setCreatePickTopCount}
      onCreatePickDueDateChange={setCreatePickDueDate}
      onCreateSubmit={(e) => void handleCreate(e)}
      onEditSubmit={(e) => void handleEdit(e)}
      onCreatePickSubmit={(e) => void handleCreatePick(e)}
    />
  );
}
