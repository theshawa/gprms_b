import { io } from "@/socket/server";
import { CustomerDineInSocket } from "./events.map";
import { prisma } from "@/prisma";
import { DiningTableStatusType } from "@prisma/client";

export const customerDineInNamespace = io.of("/customer-dine-in");

customerDineInNamespace.on(
  "connection",
  async (socket: CustomerDineInSocket) => {
    console.log(`Customer connected to /customer-dine-in: ${socket.id}`);

    // const eventBusListeners = [] as const;

    // for (const [event, handler] of eventBusListeners) {
    //   await subscribeToEvent(event, handler);
    // }

    socket.on(
      "customer-login-opened",
      async (data: { tableNo: string; message: string; timestamp: string }) => {
        try {
          const tableNo = Number(data.tableNo);
          console.log("Updating table:", tableNo);

          await prisma.diningTable.update({
            where: { id: tableNo },
            data: { status: DiningTableStatusType.WaitingForWaiter },
          });

          data.message = "Customer waiting for waiter"

          // Notify all waiters via socket
          io.of("/waiter").emit("diningTableStatusUpdate", data);
        } catch (err) {
          console.error("Failed to update table status:", err);
        }
      }
    );

    socket.on("disconnect", async () => {
      // for (const [event] of eventBusListeners) {
      //   await unsubscribeFromEvent(event);
      // }
      console.log(`Customer disconnected: ${socket.id}`);
      socket.removeAllListeners();
    });
  }
);
