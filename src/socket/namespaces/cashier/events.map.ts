import { TakeAwayOrder, TakeAwayOrderStatusType } from "@prisma/client";

export interface CashierListenEventsMap {
  getTakeAwayOrders: (status: TakeAwayOrderStatusType[]) => void;
  // Add other events specific to the cashier namespace here
}

export interface CashierEmitEventsMap {
  takeAwayOrdersResults: (orders: TakeAwayOrder[]) => void; // Replace 'any[]' with
}
