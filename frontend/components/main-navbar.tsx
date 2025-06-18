"use client";

import { useState } from "react";
import {
  Server,
  Plus,
  Settings,
  User,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "./ui/theme-switcher";

interface MainNavbarProps {
  selectedServer: string | null;
  onServerSelect: (serverId: string) => void;
}

const servers = [
  {
    id: "survival-main",
    name: "Survival Main",
    status: "online",
    players: "12/20",
  },
  {
    id: "creative-build",
    name: "Creative Build",
    status: "offline",
    players: "0/10",
  },
  { id: "modded-ftb", name: "Modded FTB", status: "starting", players: "3/15" },
];

export function MainNavbar({
  selectedServer,
  onServerSelect,
}: MainNavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isServerDialogOpen, setIsServerDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const selectedServerData = servers.find((s) => s.id === selectedServer);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Logo and Server Selector */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Server className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">BlockOps</span>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Server Selector */}
          <Dialog
            open={isServerDialogOpen}
            onOpenChange={setIsServerDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="justify-start gap-2 min-w-[200px]"
              >
                {selectedServerData ? (
                  <>
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(
                        selectedServerData.status
                      )}`}
                    />
                    <span className="truncate">{selectedServerData.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {selectedServerData.players}
                    </Badge>
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4" />
                    <span>Select Server</span>
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Server</DialogTitle>
                <DialogDescription>Choose a server to manage</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {servers.map((server) => (
                  <Button
                    key={server.id}
                    variant={selectedServer === server.id ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      onServerSelect(server.id);
                      setIsServerDialogOpen(false);
                    }}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(
                        server.status
                      )}`}
                    />
                    <span className="flex-1 truncate text-left">
                      {server.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {server.players}
                    </Badge>
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-dashed"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Server</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Center - Search */}
        {/* <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search servers, players, logs..." className="pl-10 bg-muted/50" />
          </div>
        </div> */}

        {/* Right side - Actions and User */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              3
            </Badge>
          </Button>

          <ThemeSwitcher />

          <div className="h-6 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    MC
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    minecraft_admin
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@blockops.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
