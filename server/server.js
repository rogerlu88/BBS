const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });

// Store messages by topic
const topicMessages = new Map();
// Store client subscriptions
const clientTopics = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (messageString) => {
    console.log("Message received", messageString);
    const data = JSON.parse(messageString);

    if (data.type === "join") {
      // Handle joining a topic
      const topic = data.topic;
      if (!clientTopics.has(ws)) {
        clientTopics.set(ws, new Set());
      }
      clientTopics.get(ws).add(topic);

      // Initialize topic if it doesn't exist
      if (!topicMessages.has(topic)) {
        topicMessages.set(topic, []);
      }

      // Send existing messages for this topic to the client
      ws.send(JSON.stringify({
        type: "history",
        topic: topic,
        messages: topicMessages.get(topic)
      }));

      console.log(`Client joined topic: ${topic}`);
    } 
    else if (data.type === "message") {
      // Handle new message
      const { topic, message } = data;
      if (!topicMessages.has(topic)) {
        topicMessages.set(topic, []);
      }
      
      const messageData = { message, timestamp: new Date().toISOString() };
      topicMessages.get(topic).push(messageData);

      // Broadcast to all clients subscribed to this topic
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && clientTopics.get(client)?.has(topic)) {
          client.send(JSON.stringify({
            type: "message",
            topic: topic,
            data: messageData
          }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    // Clean up client subscriptions
    clientTopics.delete(ws);
  });
});

server.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});
