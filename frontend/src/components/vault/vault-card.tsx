"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditVaultDialog } from "@/components/vault/edit-vault-dialog";
import { DeleteVaultDialog } from "@/components/vault/delete-vault-dialog";
import { VAULT_ICONS } from "@/constants/vault";
import type { Vault } from "@/types";

export function VaultCard({ vault }: { vault: Vault }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const Icon = VAULT_ICONS[vault.icon];

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <Card className="group relative h-full gap-3 rounded-2xl transition-shadow hover:shadow-lg hover:shadow-black/20">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-11 items-center justify-center rounded-xl border bg-muted/50">
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="relative z-10 text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 aria-expanded:opacity-100"
                        aria-label={`Actions for ${vault.name}`}
                      >
                        <MoreHorizontal aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => router.push(`/vaults/${vault.id}`)}
                      >
                        <FolderOpen aria-hidden="true" /> Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                        <Pencil aria-hidden="true" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleteOpen(true)}
                      >
                        <Trash2 aria-hidden="true" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="mt-2 text-base">
                  <Link
                    href={`/vaults/${vault.id}`}
                    className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:underline"
                  >
                    {vault.name}
                  </Link>
                </CardTitle>
                {vault.description && (
                  <CardDescription className="line-clamp-2">
                    {vault.description}
                  </CardDescription>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary" className="tabular-nums">
                    {vault.itemCount === 1
                      ? "1 item"
                      : `${vault.itemCount} items`}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Updated{" "}
                    {formatDistanceToNow(new Date(vault.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => router.push(`/vaults/${vault.id}`)}>
            <FolderOpen aria-hidden="true" /> Open
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil aria-hidden="true" /> Edit
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 aria-hidden="true" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <EditVaultDialog vault={vault} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteVaultDialog
        vault={vault}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
