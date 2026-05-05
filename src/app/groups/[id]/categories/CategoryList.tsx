"use client";

import { useState } from "react";
import type { Category } from "@/lib/types/category";
import { createCategory, updateCategory } from "@/services/categories";
import { CreateCategoryFormView } from "./CreateCategoryFormView";
import { EditCategoryFormView } from "./EditCategoryFormView";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description);
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
      const categoryId = await createCategory(
        groupId,
        createName.trim(),
        createDescription.trim(),
      );
      const newCategory: Category = {
        id: categoryId,
        groupId,
        name: createName.trim(),
        description: createDescription.trim(),
        createdAt: new Date(),
        creatorId: "",
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {CATEGORY_COPY.categoriesHeading}
        </h2>
        {!showCreateForm && (
          <button
            onClick={startCreate}
            className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white"
          >
            {CATEGORY_COPY.addCategoryButton}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="rounded border p-4">
          <CreateCategoryFormView
            name={createName}
            description={createDescription}
            onNameChange={setCreateName}
            onDescriptionChange={setCreateDescription}
            onSubmit={(e) => void handleCreate(e)}
            onCancel={cancelCreate}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {categories.length === 0 && !showCreateForm && (
        <p className="text-sm text-gray-500">
          {CATEGORY_COPY.noCategoriesMessage}
        </p>
      )}

      <ul className="space-y-3">
        {categories.map((category) => (
          <li key={category.id} className="rounded border p-4">
            {editingId === category.id ? (
              <EditCategoryFormView
                name={editName}
                description={editDescription}
                onNameChange={setEditName}
                onDescriptionChange={setEditDescription}
                onSubmit={(e) => void handleEdit(e)}
                onCancel={cancelEdit}
                loading={loading}
                error={error}
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { startEdit(category); }}
                  className="shrink-0 rounded border px-3 py-1 text-sm font-medium"
                >
                  {CATEGORY_COPY.editButton}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
