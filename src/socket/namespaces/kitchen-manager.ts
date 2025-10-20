import { Logger } from "@/lib/logger";
import { prisma } from "@/prisma";
import { Socket } from "socket.io";

export const registerKitchenManagerHandlers = (socket: Socket) => {
  Logger.log(
    "KITCHEN MANAGER WS NS",
    "kitchen manager connected: " + socket.id
  );

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
      socket.emit("takeaway-order-results-error", error);
    }
  });

  socket.on("disconnect", () => {
    Logger.log(
      "KITCHEN MANAGER WS NS",
      "kitchen manager disconnected: " + socket.id
    );
  });
};
