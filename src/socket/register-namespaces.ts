import { StaffRole } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { registerCashierHandlers } from "./namespaces/cashier";
import { registerKitchenManagerHandlers } from "./namespaces/kitchen-manager";
import { staffAuthRequiredMiddleware } from "./staff-auth-required-middleware";

export const registerNamespaces = (io: Server) => {
  const cashierNamespace = io.of("/cashier");
  cashierNamespace.use(staffAuthRequiredMiddleware(StaffRole.Cashier));
  cashierNamespace.on("connection", (socket: Socket) => {
    registerCashierHandlers(socket);
  });

  const kitchenManagerNamespace = io.of("/kitchen-manager");
  kitchenManagerNamespace.use(staffAuthRequiredMiddleware(StaffRole.KitchenManager));
  kitchenManagerNamespace.on("connection", (socket: Socket) => {
    registerKitchenManagerHandlers(socket);
  });
};
