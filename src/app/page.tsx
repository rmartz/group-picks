import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { HOME_PAGE_COPY } from "./copy";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          {HOME_PAGE_COPY.title}
        </h1>
        <Button render={<Link href="/groups" />}>
          {HOME_PAGE_COPY.myGroupsButton}
        </Button>
        <SignOutButton />
      </main>
    </div>
  );
}
