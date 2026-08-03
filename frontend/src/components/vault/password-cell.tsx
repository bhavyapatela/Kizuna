"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";

/**
 * Masked password display for table rows. Reveal is per-row and resets
 * when the component unmounts — passwords are never left visible.
 */
export function PasswordCell({ password }: { password?: string }) {
  const [revealed, setRevealed] = useState(false);

  if (!password) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="group/password flex items-center gap-1">
      <span
        className="font-mono text-sm tracking-tight select-none"
        aria-label={revealed ? undefined : "Hidden password"}
      >
        {revealed ? password : "••••••••••"}
      </span>
      <span className="flex opacity-0 transition-opacity group-focus-within/password:opacity-100 group-hover/password:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide password" : "Reveal password"}
          aria-pressed={revealed}
        >
          {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
        <CopyButton value={password} label="Password" />
      </span>
    </div>
  );
}
