"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { MainNavbar } from "@/components/main-navbar";
import { ServerSidebar } from "@/components/server-sidebar";
import { ServerOverview } from "@/components/server-overview";
import { ServerConsole } from "@/components/server-console";
import { MainSidebar } from "@/components/main-sidebar";

export default function BlockOpsDashboard() {
  const [selectedServer, setSelectedServer] = useState<string | null>(
    "survival-main"
  );
  const [selectedSection, setSelectedSection] = useState("overview");
  const [serverStatus, setServerStatus] = useState("online");

  const getServerName = (serverId: string) => {
    const serverNames: Record<string, string> = {
      "survival-main": "Survival Main",
      "creative-build": "Creative Build",
      "modded-ftb": "Modded FTB",
    };
    return serverNames[serverId] || "Unknown Server";
  };

  const renderContent = () => {
    if (!selectedServer) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Welcome to BlockOps</h2>
            <p className="text-muted-foreground text-lg">
              Select a server from the navbar to get started
            </p>
          </div>
        </div>
      );
    }

    switch (selectedSection) {
      case "overview":
        return (
          <ServerOverview
            serverId={selectedServer}
            serverStatus={serverStatus}
            onStatusChange={setServerStatus}
          />
        );
      case "console":
        return <ServerConsole />;
      case "players":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Player Management
            </h1>
            <p className="text-muted-foreground">
              Player management features coming soon...
            </p>
          </div>
        );
      case "whitelist":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Whitelist Management
            </h1>
            <p className="text-muted-foreground">
              Whitelist management features coming soon...
            </p>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Server Settings
            </h1>
            <p className="text-muted-foreground">
              Server settings features coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Feature Coming Soon
            </h1>
            <p className="text-muted-foreground">
              This feature is under development...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <MainNavbar
        selectedServer={selectedServer}
        onServerSelect={setSelectedServer}
      />

      <div className="flex-1 flex overflow-hidden">
        <SidebarProvider>
          {selectedServer && (
            <ServerSidebar
              selectedSection={selectedSection}
              onSectionSelect={setSelectedSection}
              serverName={getServerName(selectedServer)}
              serverStatus={serverStatus}
            />

            // <MainSidebar selectedServer={selectedServer} onServerSelect={setSelectedServer} />
          )}

          <SidebarInset className="flex-1">
            <main className="h-full p-8 overflow-auto bg-background rounded-lg">
              {renderContent()}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
