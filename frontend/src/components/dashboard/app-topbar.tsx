"use client";

import { Fragment, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MAIN_NAV, SECONDARY_NAV } from "@/constants/nav";
import { useVaults } from "@/hooks/use-vaults";
import { useUiStore } from "@/store/ui-store";

interface Crumb {
  label: string;
  href: string;
}

export function AppTopbar() {
  const pathname = usePathname();
  const { data: vaults } = useVaults();
  const setCommandPaletteOpen = useUiStore(
    (state) => state.setCommandPaletteOpen,
  );

  const crumbs = useMemo<Crumb[]>(() => {
    const segments = pathname.split("/").filter(Boolean);
    const allNav = [...MAIN_NAV, ...SECONDARY_NAV];

    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const navMatch = allNav.find((item) => item.href === href);
      const vaultMatch = vaults?.find((vault) => vault.id === segment);
      const label =
        navMatch?.title ??
        vaultMatch?.name ??
        segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, href };
    });
  }, [pathname, vaults]);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4!" />

      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <Fragment key={crumb.href}>
                <BreadcrumbItem className={isLast ? "" : "hidden sm:flex"}>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="hidden sm:flex" />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto">
        <Button
          variant="outline"
          size="sm"
          className="gap-3 text-muted-foreground sm:w-56 sm:justify-start"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search aria-hidden="true" />
          <span className="hidden sm:inline">Search vault…</span>
          <KbdGroup className="ml-auto hidden sm:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
      </div>
    </header>
  );
}
