import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppTopbar } from "@/components/dashboard/app-topbar";
import { CommandPalette } from "@/components/dashboard/command-palette";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppTopbar />
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </SidebarInset>
        <CommandPalette />
      </SidebarProvider>
    </AuthGuard>
  );
}
