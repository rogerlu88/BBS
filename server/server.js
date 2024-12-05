const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });
const messages = [];
wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.once("open", () => {
    console.log("Connected to websocket");
    ws.send(JSON.stringify({ type: "join", data: messages }));
  });
  ws.on("message", (messageString) => {
    console.log("Message received", messageString);
    const json = JSON.parse(messageString);
    const { message } = json;
    messages.push({ message });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ message }));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "join", data: messages }));
      }
    });
  });

  ws.send(JSON.stringify({ message: "Hello from server" }));
});

server.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});
