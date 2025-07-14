import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const deleteDiningAreaHandler: RequestHandler<{
  id: string;
}> = async (req, res) => {
  const currentDiningArea = await prisma.diningArea.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });
  if (!currentDiningArea) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Dining Area with this ID does not exist"
    );
  }

  const diningTables = await prisma.diningTable.findMany({
    where: {
      diningAreaId: parseInt(req.params.id),
    },
  });
  if (diningTables.length > 0) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Dining Area cannot be deleted because it has associated dining tables"
    );
  }

  await prisma.diningArea.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.sendStatus(StatusCodes.OK);
};
