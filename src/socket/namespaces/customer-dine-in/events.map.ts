import { DiningTable, Menu } from "@prisma/client";

export interface CustomerDineInListenEventsMap {
  init: () => void;
  // Add other events specific to the customer dine-in namespace here
}

export interface CustomerDineInEmitEventsMap {
  initResponse: (data: { diningTable: DiningTable; menu: Menu }) => void; // Replace 'any[]' with
  initError: (error: any) => void;
  waiterAccepted: (status: boolean) => void; // waiter-accepted
}
