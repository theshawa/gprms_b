import { prisma } from "@/prisma";
import {
  subscribeToEvent,
  unsubscribeFromEvent,
} from "@/redis/events/consumer";
import { io } from "@/socket/server";
import { staffAuthRequiredMiddleware } from "@/socket/staff-auth-required-middleware";
import {
  OrderStatusType,
  StaffRole,
  TakeAwayOrderStatusType,
} from "@prisma/client";
import { KitchenManagerSocket } from "./events.map";

export const kitchenManagerNamespace = io.of("/kitchen-manager");

kitchenManagerNamespace.on(
  "connection",
  async (socket: KitchenManagerSocket) => {
    // socket event listeners
    socket.on("getTakeAwayOrders", async () => {
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
        socket.emit("takeAwayOrdersResults", takeAwayOrders);
      } catch (error) {
        socket.emit("takeAwayOrdersError", error);
      }
    });

    // Listener for Dine-In Orders
    socket.on("getDineInOrders", async () => {
      try {
        const orders = await prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            orderItems: {
              include: { dish: { select: { name: true, price: true } } },
            },
            customer: { select: { name: true, phoneNumber: true } },
          },
        });
        socket.emit("dineInOrdersResults", orders);
      } catch (error) {
        socket.emit("dineInOrdersError", error);
      }
    });

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
        "takeaway-order-cancelled",
        async ({ orderId }: { orderId: number }) => {
          const takeAwayOrder = await prisma.takeAwayOrder.findFirst({
            where: { id: orderId, status: TakeAwayOrderStatusType.Cancelled },
            include: {
              items: {
                include: {
                  dish: true,
                },
              },
            },
          });

          if (takeAwayOrder) {
            socket.emit("takeAwayOrderCancelled", takeAwayOrder);
          }
        },
      ],
      [
        "order-placed",
        async ({ orderId }: { orderId: number }) => {
          const order = await prisma.order.findFirst({
            where: { id: orderId, status: OrderStatusType.New },
            include: {
              orderItems: {
                include: { dish: { select: { name: true, price: true } } },
              },
              customer: { select: { name: true, phoneNumber: true } },
            },
          });
          if (order) socket.emit("newDineInOrder", order);
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
  }
);

kitchenManagerNamespace.use(
  staffAuthRequiredMiddleware(StaffRole.KitchenManager)
);
