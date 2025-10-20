import { Logger } from "@/lib/logger";
import { StaffRole } from "@prisma/client";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { registerCashierHandlers } from "./namespaces/cashier";
import { registerKitchenManagerHandlers } from "./namespaces/kitchen-manager";
import { staffAuthRequiredMiddleware } from "./staff-auth-required-middleware";
import { registerWaiterHandlers } from "./namespaces/waiter";
import { registerCustomerDineInHandlers } from "./namespaces/customer-dine-in";

let io: Server | undefined;

export const intializeSocketIO = (httpServer: HttpServer) => {
  if (io) return;

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    },
  });

  Logger.log("SOCKET", "socket io initialized");

  // cashier ns
  const cashierNamespace = io.of("/cashier");
  cashierNamespace.use(staffAuthRequiredMiddleware(StaffRole.Cashier));
  cashierNamespace.on("connection", (socket) =>
    registerCashierHandlers(socket)
  );

  // waiter ns
  const waiterNamespace = io.of("/waiter");
  waiterNamespace.use(staffAuthRequiredMiddleware(StaffRole.Waiter));
  waiterNamespace.on("connection", (socket) =>
    registerWaiterHandlers(socket)
  );

  // customer-dine-in ns
  const cusomterDineInNamespace = io.of("/customer-dine-in");
  cusomterDineInNamespace.on("connection", (socket) =>
    registerCustomerDineInHandlers(socket)
  );

  // kitchenmanager ns
  const kitchenManagerNameSpace = io.of("/kitchen-manager");
  kitchenManagerNameSpace.use(
    staffAuthRequiredMiddleware(StaffRole.KitchenManager)
  );
  kitchenManagerNameSpace.on("connection", (socket) =>
    registerKitchenManagerHandlers(socket)
  );
};

export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error("socket io not initialized");
  }
  return io;
};
