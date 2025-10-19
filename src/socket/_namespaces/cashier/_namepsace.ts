import { prisma } from "@/prisma";
import { io } from "@/socket/server";
import { staffAuthRequiredMiddleware } from "@/socket/staff-auth-required-middleware";
import { OrderStatusType, StaffRole } from "@prisma/client";
import { CashierSocket } from "./events.map";

export const cashierNamespace = io.of("/cashier");

cashierNamespace.on("connection", async (socket: CashierSocket) => {
  socket.join("takeaway-room");
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
      socket.emit("takeAwayOrdersResultsError", error);
    }
  });

  // Listener for Dine-In Orders
  socket.on("getDineInOrders", async () => {
    try {
      const orders = await prisma.order.findMany({
        where: { status: OrderStatusType.New },
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: { include: { dish: { select: { name: true, price: true } } } },
          customer: { select: { name: true, phoneNumber: true } },
        },
      });
      socket.emit("dineInOrdersResults", orders);
    } catch (error) {
      socket.emit("dineInOrdersError", error);
    }
  });

  // event bus listeners
  // const eventBusListeners = [
  //   [
  //     "takeaway-order-placed",
  //     async ({ orderId }: { orderId: number }) => {
  //       const takeAwayOrder = await prisma.takeAwayOrder.findFirst({
  //         where: { id: orderId, status: TakeAwayOrderStatusType.New },
  //         include: {
  //           items: {
  //             include: {
  //               dish: true,
  //             },
  //           },
  //         },
  //       });

  //       if (takeAwayOrder) {
  //         socket.emit("newTakeAwayOrder", takeAwayOrder);
  //       }
  //     },
  //   ],
  //   [
  //     "takeaway-order-preparing",
  //     async ({ orderId }: { orderId: number }) => {
  //       const takeAwayOrder = await prisma.takeAwayOrder.findFirst({
  //         where: { id: orderId, status: TakeAwayOrderStatusType.Preparing },
  //         include: {
  //           items: {
  //             include: {
  //               dish: true,
  //             },
  //           },
  //         },
  //       });

  //       if (takeAwayOrder) {
  //         socket.emit("takeAwayOrderPreparing", takeAwayOrder);
  //       }
  //     },
  //   ],
  //   [
  //     "takeaway-order-prepared",
  //     async ({ orderId }: { orderId: number }) => {
  //       const takeAwayOrder = await prisma.takeAwayOrder.findFirst({
  //         where: { id: orderId, status: TakeAwayOrderStatusType.Prepared },
  //         include: {
  //           items: {
  //             include: {
  //               dish: true,
  //             },
  //           },
  //         },
  //       });

  //       if (takeAwayOrder) {
  //         socket.emit("takeAwayOrderPrepared", takeAwayOrder);
  //       }
  //     },
  //   ],
  //   [
  //     "order-placed",
  //     async ({ orderId }: { orderId: number }) => {
  //       const order = await prisma.order.findFirst({
  //         where: { id: orderId, status: OrderStatusType.New },
  //         include: {
  //           orderItems: {
  //             include: { dish: { select: { name: true, price: true } } },
  //           },
  //           customer: { select: { name: true, phoneNumber: true } },
  //         },
  //       });
  //       if (order) socket.emit("newDineInOrder", order);
  //     },
  //   ],
  // ] as const;

  // for (const [event, handler] of eventBusListeners) {
  //   await subscribeToEvent(event, handler);
  // }

  socket.on("disconnect", async () => {
    // for (const [event] of eventBusListeners) {
    //   await unsubscribeFromEvent(event);
    // }

    socket.removeAllListeners();
  });
});

cashierNamespace.use(staffAuthRequiredMiddleware(StaffRole.Cashier));
