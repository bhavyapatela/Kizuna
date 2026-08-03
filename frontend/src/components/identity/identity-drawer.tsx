"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff, ExternalLink, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CopyButton } from "@/components/shared/copy-button";
import { PasswordStrength } from "@/components/shared/password-strength";
import { CATEGORY_META, classifyItem } from "@/lib/identity/classify";
import { cn } from "@/lib/utils";
import type { Vault, VaultItem } from "@/types";

interface IdentityDrawerProps {
  item: VaultItem | null;
  vaults: Vault[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Account details drawer opened by clicking a node on the map. */
export function IdentityDrawer({
  item,
  vaults,
  open,
  onOpenChange,
}: IdentityDrawerProps) {
  const [revealed, setRevealed] = useState(false);

  if (!item) return null;

  const category = classifyItem(item, vaults);
  const meta = CATEGORY_META[category];
  const vaultName = vaults.find((vault) => vault.id === item.vaultId)?.name;

  const handleOpenChange = (next: boolean) => {
    if (!next) setRevealed(false);
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-sm">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border text-base font-semibold"
              style={{ color: meta.color, borderColor: `${meta.color}55` }}
              aria-hidden="true"
            >
              {item.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <SheetTitle>{item.name}</SheetTitle>
              <SheetDescription>
                Part of your {meta.label.toLowerCase()} identity
              </SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="outline" style={{ color: meta.color }}>
              {meta.label}
            </Badge>
            {vaultName && <Badge variant="secondary">{vaultName}</Badge>}
            {item.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="opacity-80">
                #{tag}
              </Badge>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {item.username && (
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Username</p>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm">{item.username}</p>
                <CopyButton value={item.username} label="Username" />
              </div>
            </div>
          )}

          {item.password && (
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Password</p>
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate font-mono text-sm",
                    !revealed && "select-none",
                  )}
                >
                  {revealed ? item.password : "••••••••••••"}
                </p>
                <span className="flex shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setRevealed((value) => !value)}
                    aria-label={revealed ? "Hide password" : "Reveal password"}
                    aria-pressed={revealed}
                  >
                    {revealed ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
                  </Button>
                  <CopyButton value={item.password} label="Password" />
                </span>
              </div>
              <PasswordStrength password={item.password} className="mt-2" />
            </div>
          )}

          {item.url && (
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Website</p>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
              >
                {item.url.replace(/^https?:\/\//, "")}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          )}

          {item.notes && (
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}

          <Separator />
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              Updated{" "}
              {formatDistanceToNow(new Date(item.updatedAt), {
                addSuffix: true,
              })}
            </p>
            <p>
              Created{" "}
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <SheetFooter className="border-t">
          <Button asChild>
            <Link href={`/vaults/${item.vaultId}`}>
              <FolderOpen aria-hidden="true" data-icon="inline-start" />
              Open in vault
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
