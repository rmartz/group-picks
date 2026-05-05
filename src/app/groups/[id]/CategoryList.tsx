"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types/category";
import {
  deleteCategory as deleteCategoryService,
  createCategory as createCategoryService,
  CategoryHasPicksError,
} from "@/services/categories";
import { CategoryListView } from "./CategoryListView";
import { CATEGORY_LIST_COPY } from "./copy";

interface CategoryListProps {
  initialCategories: Category[];
  groupId: string;
}

export function CategoryList({
  initialCategories,
  groupId,
}: CategoryListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [deletingId, setDeletingId] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | undefined>();

  async function handleDelete(categoryId: string) {
    setDeletingId(categoryId);
    setDeleteError(undefined);
    try {
      await deleteCategoryService(groupId, categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (err) {
      const message =
        err instanceof CategoryHasPicksError
          ? CATEGORY_LIST_COPY.errors.hasPicks
          : CATEGORY_LIST_COPY.errors.delete;
      setDeleteError(message);
    } finally {
      setDeletingId(undefined);
    }
  }

  async function handleAdd(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setAdding(true);
    setAddError(undefined);
    try {
      await createCategoryService(groupId, newCategoryName.trim());
      setNewCategoryName("");
      router.refresh();
    } catch {
      setAddError(CATEGORY_LIST_COPY.errors.create);
    } finally {
      setAdding(false);
    }
  }

  return (
    <CategoryListView
      categories={categories}
      onDeleteCategory={(id) => void handleDelete(id)}
      deletingId={deletingId}
      deleteError={deleteError}
      newCategoryName={newCategoryName}
      onNewCategoryNameChange={setNewCategoryName}
      onAddCategory={(e) => void handleAdd(e)}
      adding={adding}
      addError={addError}
    />
  );
}
