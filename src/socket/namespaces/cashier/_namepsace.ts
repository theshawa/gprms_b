import { prisma } from "@/prisma";
import { subscribeToEvent, unsubscribeFromEvent } from "@/redis/events/consumer";
import { io } from "@/socket/server";
import { staffAuthRequiredMiddleware } from "@/socket/staff-auth-required-middleware";
import { StaffRole, TakeAwayOrderStatusType } from "@prisma/client";
import { CashierSocket } from "./events.map";

export const cashierNamespace = io.of("/cashier");

cashierNamespace.on("connection", async (socket: CashierSocket) => {
  // socket event listeners
  socket.on(
    "getTakeAwayOrders",
    async (status: TakeAwayOrderStatusType[] = [TakeAwayOrderStatusType.New]) => {
      const takeAwayOrders = await prisma.takeAwayOrder.findMany({
        where: {
          status: {
            in: status,
          },
        },
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
      socket.emit("takeAwayOrdersResults", takeAwayOrders);
    }
  );

  // event bus listeners
  const eventBusListeners = [
    [
      "takeaway-order-placed",
      async ({ orderId }: { orderId: number }) => {
        const takeAwayOrder = await prisma.takeAwayOrder.findFirst({
          where: { id: orderId, status: TakeAwayOrderStatusType.New },
          include: {
            items: {
              include: {
                dish: true,
              },
            },
          },
        });

        if (takeAwayOrder) {
          socket.emit("newTakeAwayOrder", takeAwayOrder);
        }
      },
    ],
    [
      "takeaway-order-prepared",
      async ({ orderId }: { orderId: number }) => {
        const takeAwayOrder = await prisma.takeAwayOrder.findFirst({
          where: { id: orderId, status: TakeAwayOrderStatusType.Prepared },
          include: {
            items: {
              include: {
                dish: true,
              },
            },
          },
        });

        if (takeAwayOrder) {
          socket.emit("takeAwayOrderPrepared", orderId);
        }
      },
    ],
  ] as const;

  for (const [event, handler] of eventBusListeners) {
    await subscribeToEvent(event, handler);
  }

  socket.on("disconnect", async () => {
    for (const [event] of eventBusListeners) {
      await unsubscribeFromEvent(event);
    }

    socket.removeAllListeners();
  });
});

cashierNamespace.use(staffAuthRequiredMiddleware(StaffRole.Cashier));
