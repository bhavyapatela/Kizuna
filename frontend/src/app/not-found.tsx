import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo />
      <div className="flex size-14 items-center justify-center rounded-2xl border bg-card">
        <SearchX className="size-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for was moved, deleted, or never existed
          in the first place.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
