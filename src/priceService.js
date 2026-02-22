const WebSocket = require("ws");
const { updatePrices } = require("./priceCache");

let providerSocket;
let broadcastFunction = null;

function setBroadcaster(fn) {
    broadcastFunction = fn;
}

function connectToProvider() {
    console.log("Connecting to provider WS...");

    providerSocket = new WebSocket(
        `${process.env.PROVIDER_WS_URL}?apikey=${process.env.PROVIDER_API_KEY}`
    );

    providerSocket.on("open", () => {
        console.log("Connected to provider");

        // Subscribe to symbols (change according to provider format)
        providerSocket.send(JSON.stringify({
            action: "subscribe",
            symbols: ["GOLD", "SILVER"]
        }));
    });

    providerSocket.on("message", (data) => {
        try {
            const parsed = JSON.parse(data);

            // Adjust according to provider format
            const newPrices = {};

            if (parsed.symbol === "GOLD") {
                newPrices.gold = parsed.price;
            }

            if (parsed.symbol === "SILVER") {
                newPrices.silver = parsed.price;
            }

            if (Object.keys(newPrices).length > 0) {
                updatePrices(newPrices);

                if (broadcastFunction) {
                    broadcastFunction(newPrices);
                }
            }

        } catch (err) {
            console.error("Error parsing provider message:", err);
        }
    });

    providerSocket.on("close", () => {
        console.log("Provider WS closed. Reconnecting in 5 seconds...");
        setTimeout(connectToProvider, 5000);
    });

    providerSocket.on("error", (err) => {
        console.error("Provider WS error:", err.message);
        providerSocket.close();
    });
}

module.exports = { connectToProvider, setBroadcaster };