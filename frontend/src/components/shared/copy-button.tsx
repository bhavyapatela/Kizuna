"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  /** Toast label, e.g. "Password". */
  label: string;
  className?: string;
}

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const { copied, copy } = useClipboard();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn("text-muted-foreground hover:text-foreground", className)}
          onClick={() => copy(value, { label })}
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied ? (
            <Check className="size-4 text-success" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy {label.toLowerCase()}</TooltipContent>
    </Tooltip>
  );
}
