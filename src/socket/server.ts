import { expressServer } from "@/server";
import { Server } from "socket.io";

export const io = new Server(expressServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
});

// import "./namespaces/admin/_namepsace";
// import "./namespaces/cashier/_namepsace";
// import "./namespaces/customer-dine-in/_namepsace";
// import "./namespaces/kitchen-manager/_namepsace";
// import "./namespaces/waiter/_namepsace";
