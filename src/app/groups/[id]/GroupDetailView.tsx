import Link from "next/link";
import type { Category } from "@/lib/types/category";
import type { Group } from "@/lib/types/group";
import { GROUP_DETAIL_COPY } from "./copy";

interface GroupDetailViewProps {
  group: Group;
  categories: Category[];
}

export function GroupDetailView({ group, categories }: GroupDetailViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{group.name}</h1>
      <dl className="space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium">{GROUP_DETAIL_COPY.createdAtLabel}:</dt>
          <dd>{group.createdAt.toLocaleDateString()}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">{GROUP_DETAIL_COPY.membersLabel}:</dt>
          <dd>{group.memberIds.length}</dd>
        </div>
      </dl>
      <section>
        <h2 className="mb-2 text-lg font-medium">
          {GROUP_DETAIL_COPY.categoriesLabel}
        </h2>
        <ul className="space-y-1 text-sm">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/groups/${group.id}/categories/${category.id}`}
                className="text-blue-600 hover:underline"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
