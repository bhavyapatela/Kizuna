"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";
import { useDemoSession } from "@/hooks/use-demo-session";
import { useCurrentUser } from "@/hooks/use-auth";
import { hasBackend } from "@/lib/api-client";

/**
 * Client-side gate for authenticated routes. Currently backed by the
 * TEMPORARY demo session; with real FastAPI auth this becomes a server
 * check (middleware or layout reading the session cookie) and this
 * component can be deleted.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const mounted = useMounted();
  const demoAuthenticated = useDemoSession();
  
  // Fetch current user if real backend is active
  const { data: user, isPending, isError } = useCurrentUser();

  const authenticated = hasBackend() ? Boolean(user) : demoAuthenticated;
  const loading = hasBackend() ? isPending : !mounted;

  useEffect(() => {
    if (mounted) {
      if (hasBackend()) {
        if (!isPending && (isError || !user)) {
          router.replace("/login");
        }
      } else {
        if (!demoAuthenticated) {
          router.replace("/login");
        }
      }
    }
  }, [mounted, isPending, isError, user, demoAuthenticated, router]);

  // Render nothing while redirecting (or before the client can read the
  // session) — avoids flashing protected content.
  if (loading || !authenticated) return null;

  return <>{children}</>;
}
