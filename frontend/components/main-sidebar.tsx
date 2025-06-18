"use client"
import { Server, Plus, Settings, User, HelpCircle, Database } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MainSidebarProps {
  selectedServer: string | null
  onServerSelect: (serverId: string) => void
}

const servers = [
  { id: "survival-main", name: "Survival Main", status: "online", players: "12/20" },
  { id: "creative-build", name: "Creative Build", status: "offline", players: "0/10" },
  { id: "modded-ftb", name: "Modded FTB", status: "starting", players: "3/15" },
]

const generalItems = [
  { title: "Account Settings", icon: Settings, url: "#" },
  { title: "User Management", icon: User, url: "#" },
  { title: "Backups", icon: Database, url: "#" },
  { title: "Help & Support", icon: HelpCircle, url: "#" },
]

export function MainSidebar({ selectedServer, onServerSelect }: MainSidebarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-gray-500"
      case "starting":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Sidebar className="border-r rounded-r-full">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Server className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">BlockOps</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Your Servers</SidebarGroupLabel>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {servers.map((server) => (
                <SidebarMenuItem key={server.id}>
                  <SidebarMenuButton
                    onClick={() => onServerSelect(server.id)}
                    isActive={selectedServer === server.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(server.status)}`} />
                      <span className="truncate">{server.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {server.players}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>All systems operational</span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
