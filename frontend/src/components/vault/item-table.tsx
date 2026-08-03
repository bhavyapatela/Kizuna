"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { KeyRound, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { getItemColumns } from "@/components/vault/item-columns";
import type { VaultItem } from "@/types";
import type { ReactNode } from "react";

interface ItemTableProps {
  items: VaultItem[];
  isLoading: boolean;
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
  vaultNameOf?: (item: VaultItem) => string | undefined;
  /** Rendered inside the empty state when there are no items at all. */
  emptyAction?: ReactNode;
}

export function ItemTable({
  items,
  isLoading,
  onEdit,
  onDelete,
  vaultNameOf,
  emptyAction,
}: ItemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => getItemColumns({ onEdit, onDelete, vaultNameOf }),
    [onEdit, onDelete, vaultNameOf],
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const query = filterValue.toLowerCase();
      const { name, username, url } = row.original;
      return [name, username, url].some((value) =>
        value?.toLowerCase().includes(query),
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full max-w-xs" />
        <div className="space-y-2 rounded-2xl border p-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 py-2">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={KeyRound}
        title="Nothing here yet"
        description="Add your first item and it will show up here, encrypted and ready when you need it."
        action={emptyAction}
      />
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search
          className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Filter items…"
          className="pl-8"
          aria-label="Filter items"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No items match “{globalFilter}”.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {rows.length === 1 ? "1 item" : `${rows.length} items`}
      </p>
    </div>
  );
}
