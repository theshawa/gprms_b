import { expressServer } from "@/server";
import { Server } from "socket.io";

export const io = new Server(expressServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
});

import "./namespaces/admin/_namepsace";
import "./namespaces/waiter/_namepsace";
