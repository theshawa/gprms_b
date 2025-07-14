import { eventBus } from "@/event-bus";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const completeOrderHandler: RequestHandler = (req, res) => {
  const diningTableId = req.params.diningTableId;
  eventBus.emit("order-completed", {
    diningTableId,
  });
  res.sendStatus(StatusCodes.OK);
};
