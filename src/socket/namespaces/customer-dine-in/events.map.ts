import { Socket } from "socket.io";

export interface CustomerDineInListenEventsMap {
  // Add other events specific to the customer dine-in namespace here
}

export interface CustomerDineInEmitEventsMap {}

export type CustomerDineInSocket = Socket<
  CustomerDineInListenEventsMap,
  CustomerDineInEmitEventsMap,
  {},
  {}
>;
