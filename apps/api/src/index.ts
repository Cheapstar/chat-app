import express from "express";
import { WebSocketClient } from "./WebSocketServer/WebSocketServer.js";
import dotenv from "dotenv";
import { Redis } from "ioredis";

dotenv.config();

const app = express();
app.use(express.json());

const startServer = async () => {
  const httpServer = app.listen(8080, () => {
    console.log("WebSocket server is running at http://localhost:8080");
  });

  const redis = new Redis();
  const redisPublisher = new Redis();
  const redisSubscriber = new Redis();
  const webSocket = new WebSocketClient(
    httpServer,
    redis,
    redisPublisher,
    redisSubscriber
  );

  app.get("/", (req, res) => {
    res.send("WebSocket server is running at http://localhost:8080");
  });

  app.post("/api/message", (req, res) => {
    try {
      const { type, payload, userId } = req.body;
      const handler = webSocket?.handlers.get(userId)?.get(type);
      if (handler) {
        handler.forEach((fn) => fn({ userId, payload }));
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "Handler not found" });
      }
    } catch (err) {
      console.error("WebSocket handler error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
};

startServer();
