"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Plus, Sun } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { MAIN_NAV, SECONDARY_NAV } from "@/constants/nav";
import { ITEM_TYPE_META, VAULT_ICONS } from "@/constants/vault";
import { useVaults } from "@/hooks/use-vaults";
import { useAllItems } from "@/hooks/use-vault-items";
import { useUiStore } from "@/store/ui-store";

/**
 * Global ⌘K / Ctrl+K palette: navigation, vault jumping, and item search
 * in one place.
 */
export function CommandPalette() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const open = useUiStore((state) => state.commandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const toggle = useUiStore((state) => state.toggleCommandPalette);

  const { data: vaults } = useVaults();
  const { data: items } = useAllItems();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const run = useCallback(
    (action: () => void) => {
      setOpen(false);
      action();
    },
    [setOpen],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Search your vault or jump anywhere"
    >
      <Command>
        <CommandInput placeholder="Search items, vaults, pages…" />
        <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {[...MAIN_NAV, ...SECONDARY_NAV].map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => run(() => router.push(item.href))}
            >
              <item.icon aria-hidden="true" />
              {item.title}
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        {vaults && vaults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Vaults">
              {vaults.map((vault) => {
                const Icon = VAULT_ICONS[vault.icon];
                return (
                  <CommandItem
                    key={vault.id}
                    value={`vault ${vault.name}`}
                    onSelect={() =>
                      run(() => router.push(`/vaults/${vault.id}`))
                    }
                  >
                    <Icon aria-hidden="true" />
                    {vault.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {vault.itemCount} items
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {items && items.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Items">
              {items.map((item) => {
                const Icon = ITEM_TYPE_META[item.type].icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.name} ${item.username ?? ""}`}
                    onSelect={() =>
                      run(() => router.push(`/vaults/${item.vaultId}`))
                    }
                  >
                    <Icon aria-hidden="true" />
                    {item.name}
                    {item.username && (
                      <span className="ml-auto max-w-40 truncate text-xs text-muted-foreground">
                        {item.username}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => router.push("/generator"))}>
            <Plus aria-hidden="true" />
            Generate a password
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark"),
              )
            }
          >
            {resolvedTheme === "dark" ? (
              <Sun aria-hidden="true" />
            ) : (
              <Moon aria-hidden="true" />
            )}
            Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
          </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
