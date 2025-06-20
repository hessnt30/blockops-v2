"use client";

import type React from "react";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Terminal, Download, Trash2, Pause, Play } from "lucide-react";

// Define a type for your log entries
type LogEntry = {
  time: string;
  level: "INFO" | "WARN" | "ERROR" | "COMMAND" | "SHELL_OUTPUT" | "SHELL_ERROR";
  message: string;
  type: "server" | "command" | "player" | "auth" | "shell";
};

export function ServerConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Indicates WebSocket connection status
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for the scrollable area
  const wsRef = useRef<WebSocket | null>(null); // Ref to hold the WebSocket instance
  // Ref to manage the reconnect timeout to prevent multiple scheduled attempts
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to manage the health check interval, ensuring continuous checks when disconnected
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- URL Constants (UPDATED FOR NEW SERVER.JS) ---
  const WS_URL = "ws://localhost:8080/websocket"; // New WebSocket path
  const HEALTH_CHECK_URL = "http://localhost:8080/health"; // Health check HTTP endpoint

  // === WebSocket Connection & Health Check Logic ===
  useEffect(() => {
    // Function to clear any pending reconnect or health check timers
    const clearAllTimeouts = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };

    // Function to attempt WebSocket connection after a successful health check
    const connectWebSocket = () => {
      // Clear any pending timers specific to the WebSocket connection attempt
      clearAllTimeouts();

      // If a WebSocket is already trying to connect or is open, don't create a new one
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.CONNECTING ||
          wsRef.current.readyState === WebSocket.OPEN)
      ) {
        console.log(
          "WebSocket connection already in progress or open. Skipping new connection attempt."
        );
        setIsConnected(true); // Ensure UI state is correct
        return;
      }

      console.log("Attempting to establish WebSocket connection...");
      // Create a new WebSocket instance using the updated URL
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("WebSocket connected successfully.");
        setIsConnected(true);
        wsRef.current = ws; // Store the new, active WebSocket instance
        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
            level: "INFO",
            message: "Connected to WebSocket server.",
            type: "server",
          },
        ]);
        // Once connected, stop any ongoing health check intervals
        clearAllTimeouts();
      };

      ws.onmessage = (event) => {
        // console.log("Received data from shell:", event.data); // For detailed debugging
        const timestamp = new Date().toLocaleTimeString("en-US", {
          hour12: false,
        });
        const message = event.data.toString();

        let level: LogEntry["level"];
        let type: LogEntry["type"] = "shell"; // Default type for shell output

        // Heuristics for classifying log levels and types from server output
        if (
          message.includes("[SERVER ERROR]") ||
          message.toLowerCase().includes("error")
        ) {
          level = "SHELL_ERROR";
        } else if (message.includes("[SERVER_INFO]")) {
          level = "INFO";
          type = "server";
        } else if (
          message.includes("joined the game") ||
          message.includes("left the game")
        ) {
          level = "INFO";
          type = "player";
        } else {
          level = "SHELL_OUTPUT";
        }

        setLogs((prev) => [
          ...prev,
          { time: timestamp, level: level, message: message, type: type },
        ]);
      };

      ws.onclose = (event) => {
        console.log(
          `WebSocket closed. Code: ${event.code}, Reason: ${
            event.reason || "N/A"
          }. WasClean: ${event.wasClean}`
        );
        setIsConnected(false);
        wsRef.current = null; // Clear the reference to the closed WebSocket

        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
            level: "ERROR",
            message: `Disconnected from WebSocket server. Code: ${
              event.code
            }, Reason: ${event.reason || "N/A"}`,
            type: "server",
          },
        ]);

        // If the closure was not clean (e.g., server went down, network issue),
        // initiate the health check and reconnect loop.
        if (!event.wasClean) {
          console.log(
            "WebSocket closed unexpectedly. Initiating health check for reconnect..."
          );
          clearAllTimeouts(); // Ensure no other reconnects are pending
          // Start a repeating interval for health checks until connection is re-established
          healthCheckIntervalRef.current = setInterval(
            performHealthCheckAndConnect,
            3000
          );
        } else {
          // If clean close (e.g., component unmounts), just clear timeouts
          clearAllTimeouts();
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
            level: "ERROR",
            message: `WebSocket error: ${
              error instanceof Event
                ? "Generic Event Error"
                : error instanceof Error
                ? error.message
                : String(error)
            }`,
            type: "server",
          },
        ]);
        // Do NOT call ws.close() here. The 'onclose' event will follow automatically for fatal errors.
      };
    };

    // Main function to perform health check before attempting WebSocket connection
    const performHealthCheckAndConnect = async () => {
      clearAllTimeouts(); // Ensure no old timeouts/intervals are running

      // Check if a WebSocket is already open or trying to connect. If so, do nothing.
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        console.log(
          "WebSocket already active/connecting. Skipping health check."
        );
        setIsConnected(true); // Update UI status
        return;
      }

      console.log("Performing HTTP health check...");
      try {
        const response = await fetch(HEALTH_CHECK_URL);
        if (response.ok) {
          const data = await response.json();
          // Check both HTTP success and the server's internal status
          if (data.status === "ok" && data.serverRunning) {
            console.log(
              "Health check successful. Server is awake and Minecraft process is running."
            );
            connectWebSocket(); // Proceed to connect the WebSocket
          } else {
            console.warn(
              `Health check passed but Minecraft server status: ${data.message}. Retrying health check...`
            );
            setLogs((prev) => [
              ...prev,
              {
                time: new Date().toLocaleTimeString("en-US", { hour12: false }),
                level: "WARN",
                message: `Server not fully ready: ${data.message}. Retrying...`,
                type: "server",
              },
            ]);
            // Schedule next health check attempt
            reconnectTimeoutRef.current = setTimeout(
              performHealthCheckAndConnect,
              3000
            );
          }
        } else {
          console.error(
            `Health check failed with HTTP status: ${response.status}. Retrying...`
          );
          setLogs((prev) => [
            ...prev,
            {
              time: new Date().toLocaleTimeString("en-US", { hour12: false }),
              level: "ERROR",
              message: `Health check failed: HTTP ${response.status}. Retrying...`,
              type: "server",
            },
          ]);
          // Schedule next health check attempt
          reconnectTimeoutRef.current = setTimeout(
            performHealthCheckAndConnect,
            3000
          );
        }
      } catch (error) {
        console.error(
          "Health check failed (network/fetch error). Retrying...",
          error
        );
        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
            level: "ERROR",
            message: `Health check failed: ${
              error instanceof Error ? error.message : String(error)
            }. Retrying...`,
            type: "server",
          },
        ]);
        // Schedule next health check attempt
        reconnectTimeoutRef.current = setTimeout(
          performHealthCheckAndConnect,
          3000
        );
      }
    };

    // Initial call to start the health check and connection process when the component mounts
    // This ensures it only starts if no connection is active or a previous one has closed
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      performHealthCheckAndConnect();
    }

    // Cleanup function for useEffect (runs on component unmount or re-render if dependencies change)
    return () => {
      clearAllTimeouts(); // Clear all pending timers

      // Close the WebSocket cleanly if it's currently open
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("Cleaning up WebSocket on component unmount.");
        wsRef.current.close(1000, "Component Unmounted"); // Use a clean close code
      }
      wsRef.current = null; // Ensure the ref is nullified
    };
  }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

  const handleSendCommand = () => {
    if (!command.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open. Cannot send command.");
      setLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString("en-US", { hour12: false }),
          level: "ERROR",
          message: "Could not send command: WebSocket not connected.",
          type: "server",
        },
      ]);
      return;
    }

    // Send the command via WebSocket
    wsRef.current.send(command);

    // Add the command to the local logs
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const newLog = {
      time: timestamp,
      level: "COMMAND" as const,
      message: `${command}`,
      type: "command" as const,
    };

    setLogs((prev) => [...prev, newLog]);
    setCommand(""); // Clear the input after sending
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendCommand();
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = logs
      .map((log) => `[${log.time}] [${log.level}]: ${log.message}`)
      .join("\n");
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `server-logs-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogColor = (level: LogEntry["level"], type: LogEntry["type"]) => {
    if (level === "COMMAND") return "text-cyan-400";
    if (type === "player") return "text-green-400";
    if (type === "auth") return "text-blue-400";
    if (level === "WARN") return "text-yellow-400";
    if (level === "ERROR") return "text-red-400";
    if (level === "SHELL_OUTPUT") return "text-lime-300"; // Distinct color for shell output
    if (level === "SHELL_ERROR") return "text-orange-500"; // Distinct color for shell errors
    return "text-gray-300";
  };

  useLayoutEffect(() => {
    if (scrollAreaRef.current && !isPaused) {
      // Ensure the scroll height is correctly calculated after DOM updates
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs.length, isPaused]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Server Console</h1>
          <Badge
            variant="secondary"
            className={`${
              isConnected
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-red-500/10 text-red-600 border-red-500/20"
            }`}
          >
            {isConnected ? "Live" : "Disconnected"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <Play className="h-4 w-4 mr-2" />
            ) : (
              <Pause className="h-4 w-4 mr-2" />
            )}
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
      <Card className="h-[800px] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Live Console Output</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span>{logs.length} lines</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 ">
          <ScrollArea
            className="flex-1 w-full rounded-lg border bg-black/95 p-4 max-h-[400px] overflow-y-auto"
            ref={scrollAreaRef}
          >
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-3">
                  <span className="text-gray-500 shrink-0">[{log.time}]</span>
                  <span className="text-gray-400 shrink-0">[{log.level}]:</span>
                  <span
                    className={`${getLogColor(log.level, log.type)} break-all`}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
              {!isConnected && (
                <div className="text-red-400 text-center py-2">
                  --- Disconnected from server. Attempting to reconnect... ---
                </div>
              )}
              {isPaused && (
                <div className="text-yellow-400 text-center py-2">
                  --- Console Paused ---
                </div>
              )}
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
                disabled={!isConnected} // Disable input if not connected
              />
            </div>
            <Button
              onClick={handleSendCommand}
              disabled={!command.trim() || !isConnected}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
