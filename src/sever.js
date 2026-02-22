require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const { connectToProvider, setBroadcaster } = require("./priceService");
const { getPrices } = require("./priceCache");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// WebSocket server for mobile apps
wss.on("connection", (ws) => {
    console.log("New client connected");
    clients.add(ws);

    // Send cached price immediately
    ws.send(JSON.stringify({
        type: "initial",
        data: getPrices()
    }));

    ws.on("close", () => {
        console.log("Client disconnected");
        clients.delete(ws);
    });
});

// Broadcast function
function broadcast(data) {
    const message = JSON.stringify({
        type: "update",
        data
    });

    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

setBroadcaster(broadcast);

// Start provider connection
connectToProvider();

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});