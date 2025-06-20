import { createServer } from "http";
import { parse } from "url";
import { WebSocketServer, WebSocket } from "ws";
import { spawn } from "child_process";
import cors from "cors";

// --- Constants ---
const MINECRAFT_SERVER_DIRECTORY =
  "C:\\Users\\Nicholas\\Desktop\\Stuff\\all-my-minecraft-servers\\1.18.1-server"; // change this to your actual Minecraft server directory (make sure its absolute)
const MINECRAFT_SERVER_JAR_NAME = "minecraft_server.1.18.1.jar"; // change this to your actual server JAR file name
const SERVER_PORT = 8080; // you can leave this as is

// --- WebSocket Server Setup ---
// Initialize WebSocketServer in 'noServer' mode.
// This means it won't automatically listen on a port.
// Instead, it will attach to an existing HTTP server.
// This is so we can do a health check before attempting
// to connect to the websocket
const wss = new WebSocketServer({ noServer: true });

// --- Minecraft Server Process Management ---
let minecraftServerProcess = null;

/**
 * Spawns the Minecraft server process if it's not already running.
 * This function is called once when the main server starts.
 */
function startMinecraftServer() {
  if (minecraftServerProcess && !minecraftServerProcess.killed) {
    console.log("Minecraft server process already running. Skipping spawn.");
    return;
  }

  console.log(`Starting Minecraft server from: ${MINECRAFT_SERVER_DIRECTORY}`);
  // spawn the minecraft server process with typical server.jar args (1GB RAM currently)
  minecraftServerProcess = spawn(
    "java",
    [
      "-Xmx1024M", // Max memory allocation
      "-Xms1024M", // Initial memory allocation
      "-jar",
      MINECRAFT_SERVER_JAR_NAME, // The Minecraft server JAR file
      "nogui", // Run without a graphical user interface
    ],
    {
      cwd: MINECRAFT_SERVER_DIRECTORY, // Set the current working directory for the process
      stdio: ["pipe", "pipe", "pipe"], // Pipe stdin, stdout, stderr for communication
    }
  );

  // --- Attach Listeners to Minecraft Server Process ---

  // Listen for data from Minecraft server's standard output
  minecraftServerProcess.stdout.on("data", (data) => {
    const output = data.toString();

    // Send the output to ALL currently connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(output);
      }
    });
  });

  // Listen for data from Minecraft server's standard error
  minecraftServerProcess.stderr.on("data", (data) => {
    const errorOutput = data.toString();
    console.error(`Minecraft server error: ${errorOutput}`);

    // Send the error output to ALL currently connected WebSocket clients
    // Prepend a tag for client-side identification
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`[SERVER ERROR] ${errorOutput}`);
      }
    });
  });

  // Listen for the Minecraft server process closing
  minecraftServerProcess.on("close", (code) => {
    console.log(`Minecraft server process exited with code ${code}`);
    minecraftServerProcess = null; // Clear the reference as the process is gone
    const message = `[SERVER_INFO] Minecraft server stopped with code ${code}.`;

    // Inform ALL connected clients that the server has stopped
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        client.close(); // Close client WebSocket connection if the backing server is gone
      }
    });
    console.log(
      "Minecraft server stopped. Consider restarting it manually or automatically."
    );
  });

  // Listen for errors when trying to spawn or interact with the Minecraft server process
  minecraftServerProcess.on("error", (err) => {
    console.error(`Failed to spawn Minecraft server process: ${err.message}`);
    minecraftServerProcess = null; // Clear the reference on spawn error
    const message = `[SERVER_ERROR] Failed to start Minecraft server: ${err.message}`;

    // Inform ALL connected clients about the failure
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        client.close();
      }
    });
  });
}

// --- HTTP Server Setup for Health Checks and WebSocket Upgrades ---

// Create a HTTP server
const server = createServer((req, res) => {
  // fucking cors
  cors({
    origin: "http://localhost:3000", // dev frontend
    methods: ["GET", "POST"],
    // credentials: true, // if sending cookies or auth headers
  })(req, res, () => {
    const reqUrl = parse(req.url, true);

    // @health endpoint for health checks
    if (reqUrl.pathname === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          serverRunning:
            !!minecraftServerProcess && !minecraftServerProcess.killed,
          message:
            !!minecraftServerProcess && !minecraftServerProcess.killed
              ? "Minecraft server process active."
              : "Minecraft server process not active.",
        })
      );
    } else {
      // For any other requests, return 404
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });
});

// Attach the WebSocket server to the HTTP server's 'upgrade' event.
// This allows WebSocket connections to share the same port as the HTTP server.
// This is necesary to have the health check endpoint work properly
server.on("upgrade", (request, socket, head) => {
  const pathname = parse(request.url).pathname;

  // Only handle WebSocket upgrades on the '/websocket' path
  if (pathname === "/websocket") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      // Emit the 'connection' event, similar to when wss listens directly
      wss.emit("connection", ws, request);
    });
  } else {
    // If not a /websocket upgrade, destroy the socket
    socket.destroy();
  }
});

// Start the HTTP server (which will also handle WebSocket upgrades)
server.listen(SERVER_PORT, () => {
  console.log(`HTTP server listening on http://localhost:${SERVER_PORT}`);
  console.log(
    `WebSocket connections expected on ws://localhost:${SERVER_PORT}/websocket`
  );

  // Start the Minecraft server process once the HTTP server is listening
  startMinecraftServer();
});

// --- WebSocket Connection Handling for Individual Clients ---
// This handles each individual client connecting to the WebSocket
wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket to Minecraft console.");

  // Send an initial message to the newly connected client about server status
  if (!minecraftServerProcess || minecraftServerProcess.killed) {
    ws.send(
      "[SERVER_INFO] Minecraft server is not running or has stopped. Please start it on the host."
    );
  } else {
    ws.send("[SERVER_INFO] Connected to running Minecraft server console.");
  }

  // Listener for messages received from the client
  ws.on("message", (message) => {
    const command = message.toString().trim();
    console.log(`Received command from client: "${command}"`);

    // Forward the command to the Minecraft server's standard input
    if (minecraftServerProcess && !minecraftServerProcess.killed) {
      minecraftServerProcess.stdin.write(command + "\n"); // Add newline to simulate Enter
    } else {
      // Inform the client if the Minecraft server is not active
      ws.send(
        "[SERVER_ERROR] Cannot send command: Minecraft server is not running."
      );
      console.warn(
        "Attempted to send command, but Minecraft server process is not active."
      );
    }
  });

  // Listener for client WebSocket closing
  ws.on("close", (code) => {
    console.log(`Client disconnected with code ${code}`);
    // IMPORTANT: Do NOT call minecraftServerProcess.stdin.end() here.
    // This would shut down the Minecraft server every time a client disconnects.
    // The Minecraft server should persist independently of client connections.
  });

  // Listener for WebSocket errors specific to this client connection
  ws.on("error", (error) => {
    console.error(`WebSocket error for client: ${error}`);
  });
});
