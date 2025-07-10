import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Exception } from "../../../../lib/exception";
import { prisma } from "../../../../prisma";

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

  res.sendStatus(StatusCodes.OK);
};
