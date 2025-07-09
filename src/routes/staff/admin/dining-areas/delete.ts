import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Exception } from "../../../../lib/exception";
import { prisma } from "../../../../prisma";

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

  await prisma.diningArea.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.sendStatus(StatusCodes.OK);
};
