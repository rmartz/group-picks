import type { Group } from "@/lib/types/group";
import { GROUP_DETAIL_COPY } from "./copy";

interface GroupMember {
  uid: string;
  name: string;
}

interface GroupDetailViewProps {
  group: Group;
  members: GroupMember[];
}

export function GroupDetailView({ group, members }: GroupDetailViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-8 p-6">
      <h1 className="text-2xl font-semibold">{group.name}</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">
          {GROUP_DETAIL_COPY.membersTitle}
        </h2>
        <ul className="space-y-1">
          {members.map(({ uid, name }) => (
            <li key={uid} className="text-sm text-zinc-700">
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">
          {GROUP_DETAIL_COPY.categoriesTitle}
        </h2>
        <p className="text-sm text-zinc-500">
          {GROUP_DETAIL_COPY.noCategories}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">{GROUP_DETAIL_COPY.picksTitle}</h2>
        <p className="text-sm text-zinc-500">{GROUP_DETAIL_COPY.noPicks}</p>
      </section>
    </main>
  );
}
