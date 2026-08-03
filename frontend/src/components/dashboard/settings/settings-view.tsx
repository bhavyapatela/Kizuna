"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { AppearanceSettings } from "./appearance-settings";
import { ProfileSettings } from "./profile-settings";
import { SecuritySettings } from "./security-settings";

export function SettingsView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Tune Kizuna to the way you work."
      />

      <Tabs defaultValue="profile" className="gap-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
