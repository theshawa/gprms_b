import { Logger } from "@/lib/logger";
import { prisma } from "@/prisma";
import { Socket } from "socket.io";

export const registerCashierHandlers = (socket: Socket) => {
  Logger.log("CASHIER WS NAMESPACE", "cashier connected:" + socket.id);

  socket.join("takeaway-room");

  socket.on("get-takeaway-orders", async () => {
    try {
      const takeAwayOrders = await prisma.takeAwayOrder.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          items: {
            include: {
              dish: true,
            },
          },
        },
      });
      socket.emit("takeaway-orders-results", takeAwayOrders);
    } catch (error) {
      socket.emit("takeaway-orders-results-error", error);
    }
  });

  socket.on("disconnect", () => {
    Logger.log("CASHIER WS NAMESPACE", "cashier disconnected:" + socket.id);
  });
};
