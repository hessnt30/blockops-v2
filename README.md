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

1. Install websocket deps & start websocket server:
   ```bash
   npm install && node websocket.js
   ```
2. Navigate to frontend:
   ```bash
   cd frontend
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

## Contributing

Open issues or pull requests for improvements.

## License

MIT
