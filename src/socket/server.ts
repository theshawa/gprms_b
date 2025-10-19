import { expressServer } from "@/server";
import { Server } from "socket.io";

export const io = new Server(expressServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
});

import "./_namespaces/admin/_namepsace";
import "./_namespaces/cashier/_namepsace";
import "./_namespaces/customer-dine-in/_namepsace";
import "./_namespaces/kitchen-manager/_namepsace";
import "./_namespaces/waiter/_namepsace";
