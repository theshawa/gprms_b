import { Logger } from "@/lib/logger";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { registerNamespaces } from "./register-namespaces";

let io: Server | undefined;

export const initSocketIO = (httpServer: HttpServer) => {
  if (io) return;
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    },
  });
  registerNamespaces(io);
  Logger.log("SOCKET", "Socket.IO initialized");
};

export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
