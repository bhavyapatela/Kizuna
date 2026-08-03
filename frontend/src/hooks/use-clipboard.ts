"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CopyOptions {
  /** Label announced in the toast, e.g. "Password". */
  label?: string;
  /** Suppress the toast for silent copies. */
  silent?: boolean;
}

/**
 * Clipboard helper with feedback. `copied` flips back after a short
 * delay so buttons can swap their icon temporarily.
 */
export function useClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const copy = useCallback(
    async (value: string, options: CopyOptions = {}) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        if (!options.silent) {
          toast.success(`${options.label ?? "Value"} copied to clipboard`);
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), resetMs);
      } catch {
        toast.error("Clipboard access was blocked by the browser");
      }
    },
    [resetMs],
  );

  return { copied, copy };
}
