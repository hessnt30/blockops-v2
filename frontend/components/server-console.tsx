"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Terminal, Download, Trash2, Pause, Play } from "lucide-react"

const mockLogs = [
  { time: "12:34:56", level: "INFO", message: "Starting minecraft server version 1.20.4", type: "server" },
  { time: "12:34:57", level: "INFO", message: "Loading properties", type: "server" },
  { time: "12:34:58", level: "INFO", message: "Default game type: SURVIVAL", type: "server" },
  { time: "12:34:59", level: "INFO", message: "Generating keypair", type: "server" },
  { time: "12:35:00", level: "INFO", message: "Starting Minecraft server on *:25565", type: "server" },
  { time: "12:35:01", level: "INFO", message: "Using epoll channel type", type: "server" },
  { time: "12:35:02", level: "INFO", message: 'Preparing level "world"', type: "server" },
  {
    time: "12:35:03",
    level: "INFO",
    message: "Preparing start region for dimension minecraft:overworld",
    type: "server",
  },
  { time: "12:35:04", level: "INFO", message: 'Done (2.1s)! For help, type "help"', type: "server" },
  {
    time: "12:35:05",
    level: "INFO",
    message: "UUID of player Steve is 12345678-1234-1234-1234-123456789012",
    type: "auth",
  },
  { time: "12:35:06", level: "INFO", message: "Steve joined the game", type: "player" },
]

export function ServerConsole() {
  const [logs, setLogs] = useState(mockLogs)
  const [command, setCommand] = useState("")
  const [isPaused, setIsPaused] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSendCommand = () => {
    if (!command.trim()) return

    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false })
    const newLog = {
      time: timestamp,
      level: "COMMAND" as const,
      message: `Executed: ${command}`,
      type: "command" as const,
    }

    setLogs((prev) => [...prev, newLog])
    setCommand("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendCommand()
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const downloadLogs = () => {
    const logText = logs.map((log) => `[${log.time}] [${log.level}]: ${log.message}`).join("\n")
    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `server-logs-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getLogColor = (level: string, type: string) => {
    if (level === "COMMAND") return "text-cyan-400"
    if (type === "player") return "text-green-400"
    if (type === "auth") return "text-blue-400"
    if (level === "WARN") return "text-yellow-400"
    if (level === "ERROR") return "text-red-400"
    return "text-gray-300"
  }

  useEffect(() => {
    if (scrollAreaRef.current && !isPaused) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [logs, isPaused])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Server Console</h1>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            Live
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Console */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Live Console Output</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>{logs.length} lines</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 w-full rounded-lg border bg-black/95 p-4" ref={scrollAreaRef}>
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-3">
                  <span className="text-gray-500 shrink-0">[{log.time}]</span>
                  <span className="text-gray-400 shrink-0">[{log.level}]:</span>
                  <span className={`${getLogColor(log.level, log.type)} break-all`}>{log.message}</span>
                </div>
              ))}
              {isPaused && <div className="text-yellow-400 text-center py-2">--- Console Paused ---</div>}
            </div>
          </ScrollArea>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                $
              </span>
              <Input
                placeholder="Enter server command..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                className="font-mono pl-8 bg-muted/50"
              />
            </div>
            <Button onClick={handleSendCommand} disabled={!command.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
