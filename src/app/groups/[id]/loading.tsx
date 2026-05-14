import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </main>
  );
}
