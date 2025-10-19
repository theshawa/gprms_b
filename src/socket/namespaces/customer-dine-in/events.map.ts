import { Socket } from "socket.io";

export interface CustomerDineInListenEventsMap {
  // Add other events specific to the customer dine-in namespace here
  "customer-login-opened": (data: { tableNo: string; message: string; timestamp: string }) => void;
}

export interface CustomerDineInEmitEventsMap {
  "diningTableStatusUpdate": (data: { tableNo: string; message: string; timestamp: string }) => void;
}

export type CustomerDineInSocket = Socket<
  CustomerDineInListenEventsMap,
  CustomerDineInEmitEventsMap,
  {},
  {}
>;
