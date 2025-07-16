import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const deleteDiningTableHandler: RequestHandler<{
  id: string;
}> = async (req, res) => {
  const currentDiningTable = await prisma.diningTable.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!currentDiningTable) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Dining Table with this ID does not exist"
    );
  }

  await prisma.diningTable.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  await publishEvent(
    "dining-table-deleted-in-dining-area",
    currentDiningTable.diningAreaId
  );

  res.sendStatus(StatusCodes.OK);
};
