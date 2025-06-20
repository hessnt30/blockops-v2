"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Square, RotateCcw, Users, Cpu, HardDrive, Wifi, Clock, Loader2, TrendingUp } from "lucide-react"

interface ServerOverviewProps {
  serverId: string
  serverStatus: string
  onStatusChange: (status: string) => void
}

export function ServerOverview({ serverId, serverStatus, onStatusChange }: ServerOverviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uptime, setUptime] = useState("2h 34m")

  const handleServerAction = async (action: "start" | "stop" | "restart") => {
    setIsLoading(true)

    if (action === "stop") {
      onStatusChange("stopping")
      setTimeout(() => {
        onStatusChange("offline")
        setIsLoading(false)
      }, 3000)
    } else if (action === "start") {
      onStatusChange("starting")
      setTimeout(() => {
        onStatusChange("online")
        setIsLoading(false)
      }, 5000)
    } else if (action === "restart") {
      onStatusChange("stopping")
      setTimeout(() => {
        onStatusChange("starting")
        setTimeout(() => {
          onStatusChange("online")
          setIsLoading(false)
        }, 5000)
      }, 3000)
    }
  }

  const getStatusBadge = () => {
    switch (serverStatus) {
      case "online":
        return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>
      case "offline":
        return <Badge variant="secondary">Offline</Badge>
      case "starting":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Starting</Badge>
      case "stopping":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Stopping</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Server Overview</h1>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground">
            {serverStatus === "online" && "Server is running smoothly"}
            {serverStatus === "offline" && "Server is currently offline"}
            {serverStatus === "starting" && "Server is starting up..."}
            {serverStatus === "stopping" && "Server is shutting down..."}
          </p>
        </div>

        <div className="flex gap-3">
          {serverStatus === "offline" && (
            <Button onClick={() => handleServerAction("start")} disabled={isLoading} size="lg">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Start Server
            </Button>
          )}
          {serverStatus === "online" && (
            <>
              <Button variant="outline" onClick={() => handleServerAction("restart")} disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                Restart
              </Button>
              <Button variant="destructive" onClick={() => handleServerAction("stop")} disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Square className="h-4 w-4 mr-2" />}
                Stop Server
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Players Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">of 20 max players</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uptime}</div>
            <p className="text-xs text-muted-foreground">since last restart</p>
            <div className="mt-2 text-xs text-blue-600">99.9% this month</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <Progress value={23} className="mt-2" />
            <div className="mt-2 text-xs text-muted-foreground">Average: 18%</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1GB</div>
            <Progress value={52} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">of 4GB allocated</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Server Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Version</p>
                <p className="text-sm font-semibold">Minecraft 1.20.4</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Server Type</p>
                <p className="text-sm font-semibold">Paper</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">World</p>
                <p className="text-sm font-semibold">Survival World</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                <p className="text-sm font-semibold">Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              Connection Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Server IP</p>
                <p className="text-sm font-semibold font-mono">mc.yourserver.com</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Port</p>
                <p className="text-sm font-semibold font-mono">25565</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">MOTD</p>
                <p className="text-sm font-semibold">Welcome to our amazing server!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">12:34 PM</span>
              <span>
                Player <strong>Steve</strong> joined the server
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">12:30 PM</span>
              <span>Server backup completed successfully</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">12:25 PM</span>
              <span>
                Plugin <strong>WorldEdit</strong> updated to v7.2.15
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
