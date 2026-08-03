"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/shared/logo";
import { BrandLogo } from "@/components/landing/brand-logo";
import { NavUser } from "@/components/dashboard/nav-user";
import { CreateVaultDialog } from "@/components/vault/create-vault-dialog";
import { MAIN_NAV, SECONDARY_NAV } from "@/constants/nav";
import { VAULT_ICONS } from "@/constants/vault";
import { useVaults } from "@/hooks/use-vaults";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: vaults, isPending } = useVaults();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Kizuna">
              <Link href="/dashboard" aria-label="Kizuna home">
                {/* Wordmark when expanded, compact mark when collapsed */}
                <Logo
                  markOnly
                  className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:mx-auto"
                />
                <BrandLogo
                  height={30}
                  className="group-data-[collapsible=icon]:hidden"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(`${item.href}/`))
                    }
                  >
                    <Link href={item.href}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Vaults</SidebarGroupLabel>
          <CreateVaultDialog>
            <SidebarGroupAction title="New vault">
              <Plus aria-hidden="true" />
              <span className="sr-only">New vault</span>
            </SidebarGroupAction>
          </CreateVaultDialog>
          <SidebarGroupContent>
            <SidebarMenu>
              {isPending
                ? Array.from({ length: 3 }, (_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))
                : vaults?.map((vault) => {
                    const Icon = VAULT_ICONS[vault.icon];
                    return (
                      <SidebarMenuItem key={vault.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === `/vaults/${vault.id}`}
                        >
                          <Link href={`/vaults/${vault.id}`}>
                            <Icon aria-hidden="true" />
                            <span>{vault.name}</span>
                            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                              {vault.itemCount}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {SECONDARY_NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <Link href={item.href}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
