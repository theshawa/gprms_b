import { io } from "@/socket/server";
import { staffAuthRequiredMiddleware } from "@/socket/staff-auth-required-middleware";
import {
  StaffMember,
  StaffRole,
  TakeAwayOrderStatusType,
} from "@prisma/client";
import { Socket } from "socket.io";
import { CashierEmitEventsMap, CashierListenEventsMap } from "./events.map";
import { getTakeAwayOrders } from "./helpers/get-takeaway-orders";

export const cashierNamespace = io.of("/cashier");

cashierNamespace.on(
  "connection",
  async (
    socket: Socket<
      CashierListenEventsMap,
      CashierEmitEventsMap,
      {},
      {
        user: StaffMember;
      }
    >
  ) => {
    socket.on(
      "getTakeAwayOrders",
      async (
        status: TakeAwayOrderStatusType[] = [TakeAwayOrderStatusType.New]
      ) => {
        const takeAwayOrders = await getTakeAwayOrders(status);
        socket.emit("takeAwayOrdersResults", takeAwayOrders);
      }
    );

    // const eventBusListeners = [
    //   ["waiter-assigned", handleWaiterAssignmentChange],
    //   ["waiter-unassigned", handleWaiterAssignmentChange],
    //   ["dining-area-updated", handleDiningAreaChange],
    //   ["dining-table-created-in-dining-area", handleDiningAreaChange],
    //   ["dining-table-deleted-in-dining-area", handleDiningAreaChange],
    //   ["dining-table-updated-in-dining-area", handleDiningAreaChange],
    //   ["order-started", handleOrderStarted],
    //   ["order-ended", handleOrderEnded],
    //   ["waiter-accepted-table", handleWaiterAcceptTable],
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
  }
);

cashierNamespace.use(staffAuthRequiredMiddleware(StaffRole.Cashier));
