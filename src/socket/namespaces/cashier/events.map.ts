import { Order, OrderStatusType, StaffMember, TakeAwayOrder, TakeAwayOrderStatusType } from "@prisma/client";
import { Socket } from "socket.io";

export interface CashierListenEventsMap {
  getTakeAwayOrders: (status: TakeAwayOrderStatusType[]) => void;
  getDineInOrders: (status: OrderStatusType[]) => void;
  // Add other events specific to the cashier namespace here
}

export interface CashierEmitEventsMap {
  takeAwayOrdersResults: (orders: TakeAwayOrder[]) => void; // Replace 'any[]' with
  takeAwayOrdersResultsError: (err: any) => void;
  newTakeAwayOrder: (order: TakeAwayOrder) => void;
  takeAwayOrderPreparing: (orderId: TakeAwayOrder) => void;
  takeAwayOrderPrepared: (orderId: TakeAwayOrder) => void;

  dineInOrdersResults: (orders: Order[]) => void; // Replace 'any[]' with
  dineInOrdersError: (err: any) => void;
  newDineInOrder: (order: Order) => void;
}

export type CashierSocket = Socket<
  CashierListenEventsMap,
  CashierEmitEventsMap,
  {},
  {
    user: StaffMember;
  }
>;
