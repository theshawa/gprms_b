import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../prisma";

export const deleteActivityLogsHandler: RequestHandler<{
  staffMemberId: string;
}> = async (req, res) => {
  await prisma.staffActivityLog.deleteMany({
    where: {
      staffMemberId: parseInt(req.params.staffMemberId),
    },
  });

  res.sendStatus(StatusCodes.OK);
};
