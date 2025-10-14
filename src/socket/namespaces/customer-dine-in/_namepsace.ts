import { io } from "@/socket/server";
import { CustomerDineInSocket } from "./events.map";

export const customerDineInNamespace = io.of("/customer-dine-in");

customerDineInNamespace.on("connection", async (socket: CustomerDineInSocket) => {
  // const eventBusListeners = [] as const;

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
