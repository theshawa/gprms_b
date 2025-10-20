import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const startOrderHandler: RequestHandler = async (req, res) => {
  // await publishEvent("order-started", parseInt(req.params.diningTableId));

  // waiterNamespace
  //   .to(`diningArea:${diningTable.diningAreaId}`)
  //   .emit("customerWaitingAtDiningTable", {
  //     tableId: diningTable.id,
  //     diningAreaId: diningTable.diningAreaId,
  //   });

  res.sendStatus(StatusCodes.OK);
};
