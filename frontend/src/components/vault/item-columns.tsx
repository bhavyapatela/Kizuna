"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyButton } from "@/components/shared/copy-button";
import { PasswordCell } from "@/components/vault/password-cell";
import { ITEM_TYPE_META } from "@/constants/vault";
import { useToggleFavorite } from "@/hooks/use-vault-items";
import { cn } from "@/lib/utils";
import type { VaultItem } from "@/types";

function FavoriteCell({ item }: { item: VaultItem }) {
  const toggleFavorite = useToggleFavorite();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => toggleFavorite.mutate(item)}
      disabled={toggleFavorite.isPending}
      aria-label={
        item.favorite
          ? `Remove ${item.name} from favorites`
          : `Add ${item.name} to favorites`
      }
      aria-pressed={item.favorite}
    >
      <Star
        className={cn(
          "size-4 transition-colors",
          item.favorite
            ? "fill-warning text-warning"
            : "text-muted-foreground/50 hover:text-muted-foreground",
        )}
        aria-hidden="true"
      />
    </Button>
  );
}

interface ItemColumnOptions {
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
  /** Show which vault each row belongs to (used on the Favorites page). */
  vaultNameOf?: (item: VaultItem) => string | undefined;
}

export function getItemColumns({
  onEdit,
  onDelete,
  vaultNameOf,
}: ItemColumnOptions): ColumnDef<VaultItem>[] {
  const columns: ColumnDef<VaultItem>[] = [
    {
      id: "favorite",
      header: () => <span className="sr-only">Favorite</span>,
      cell: ({ row }) => <FavoriteCell item={row.original} />,
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown aria-hidden="true" />
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const TypeIcon = ITEM_TYPE_META[item.type].icon;
        return (
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
              <TypeIcon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{item.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {vaultNameOf?.(item) ?? item.url?.replace(/^https?:\/\//, "") ??
                  ITEM_TYPE_META[item.type].label}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => {
        const username = row.original.username;
        if (!username) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="group/username flex items-center gap-1">
            <span className="max-w-44 truncate text-sm">{username}</span>
            <CopyButton
              value={username}
              label="Username"
              className="opacity-0 transition-opacity group-focus-within/username:opacity-100 group-hover/username:opacity-100"
            />
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "password",
      header: "Password",
      cell: ({ row }) => <PasswordCell password={row.original.password} />,
      enableSorting: false,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ArrowUpDown aria-hidden="true" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.updatedAt), {
            addSuffix: true,
          })}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  aria-label={`Actions for ${item.name}`}
                >
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(item)}>
                  <Pencil aria-hidden="true" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(item)}
                >
                  <Trash2 aria-hidden="true" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 40,
      enableSorting: false,
    },
  ];

  return columns;
}
