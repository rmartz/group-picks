import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </main>
  );
}
