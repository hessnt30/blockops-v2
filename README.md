# blockops-v2

## Overview

**blockops-v2** is a Next.js web app with real-time features powered by WebSockets. The `websocket.js` module handles all live client-server communication.

## Features

- Next.js frontend
- Real-time updates via `websocket.js`
- Modular codebase

## Prerequisites

You will need to have a minecraft server.jar available to test with. Once you have the server,
you will need to input your server's file location into websocket.js. (Should move this to .env soon)

## Getting Started

### Websocket Server

1. Install websocket deps:
   ```bash
   npm install
   ```
2. Input Minecraft server info:
   ```bash
   # ~/.env.local
   MINECRAFT_SERVER_DIRECTORY=[absolute path to your Minecraft server's directory]
   MINECRAFT_SERVER_JAR=["server.jar" or whatever your's is named]
   ```
3. Start websocket server:
   ```bash
   node websocket.js
   ```

### Frontend

1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Supabase environment variables:
   ```bash
   # ~/frontend/.env.local
   NEXT_PUBLIC_SUPABASE_URL=[i will give this to you]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[i will give this to you]
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## websocket.js

Handles WebSocket connections, message dispatch, and event subscriptions for real-time features.

Go to `Console` in the side navbar to see it in action

## License

MIT
