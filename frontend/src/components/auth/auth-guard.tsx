"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";
import { useDemoSession } from "@/hooks/use-demo-session";

/**
 * Client-side gate for authenticated routes. Currently backed by the
 * TEMPORARY demo session; with real FastAPI auth this becomes a server
 * check (middleware or layout reading the session cookie) and this
 * component can be deleted.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const mounted = useMounted();
  const authenticated = useDemoSession();

  useEffect(() => {
    if (mounted && !authenticated) {
      router.replace("/login");
    }
  }, [mounted, authenticated, router]);

  // Render nothing while redirecting (or before the client can read the
  // session) — avoids flashing protected content.
  if (!mounted || !authenticated) return null;

  return <>{children}</>;
}
