"use client";

import {
  Terminal,
  Settings,
  Users,
  Shield,
  BarChart3,
  FileText,
  Download,
  Wrench,
  Globe,
  Activity,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface ServerSidebarProps {
  selectedSection: string;
  onSectionSelect: (section: string) => void;
  serverName: string;
  serverStatus: string;
}

const serverSections = [
  { id: "overview", title: "Overview", icon: BarChart3 },
  { id: "console", title: "Console", icon: Terminal },
  { id: "players", title: "Players", icon: Users },
  { id: "whitelist", title: "Whitelist", icon: Shield },
  { id: "settings", title: "Server Settings", icon: Settings },
  { id: "world", title: "World Management", icon: Globe },
  { id: "plugins", title: "Plugins", icon: Wrench },
  { id: "logs", title: "Logs", icon: FileText },
  { id: "backups", title: "Backups", icon: Download },
];

export function ServerSidebar({
  selectedSection,
  onSectionSelect,
  serverName,
  serverStatus,
}: ServerSidebarProps) {
  const getStatusColor = () => {
    switch (serverStatus) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-gray-500";
      case "starting":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Sidebar className="my-16 " variant="inset">
      {/* <SidebarHeader className="border-b p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
            <h2 className="font-semibold truncate">{serverName}</h2>
          </div>
          <p className="text-sm text-muted-foreground">Server Management</p>
        </div>
      </SidebarHeader> */}

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {serverSections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionSelect(section.id)}
                    isActive={selectedSection === section.id}
                    className="gap-3 py-2.5"
                  >
                    <section.icon className="h-4 w-4" />
                    <span>{section.title}</span>
                    {section.id === "console" && serverStatus === "online" && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 px-1.5 text-xs"
                      >
                        Live
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>Server monitoring active</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
