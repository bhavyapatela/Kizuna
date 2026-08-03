"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True after hydration, false during SSR and the first client render.
 * Implemented with useSyncExternalStore so it never triggers the
 * setState-in-effect cascading-render problem.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
