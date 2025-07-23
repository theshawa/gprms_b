import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const acceptTableHandler: RequestHandler<
  { tableId: string },
  {},
  {},
  {},
  { user: StaffMember }
> = async (req, res) => {
  const { tableId } = req.params;

  const waiterId = res.locals.user.id;

  //   await publishEvent("waiter-accepted-table", {
  //     waiterId,
  //     tableId,
  //   });

  res.sendStatus(StatusCodes.OK);
};
