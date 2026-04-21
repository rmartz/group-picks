import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Group Picks</h1>
        <Link
          href="/groups"
          className="rounded bg-black px-6 py-3 text-sm font-medium text-white"
        >
          My Groups
        </Link>
        <SignOutButton />
      </main>
    </div>
  );
}
