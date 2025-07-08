import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Exception } from "../../../../lib/exception";
import { prisma } from "../../../../prisma";

export const deleteLocationHandler: RequestHandler<{
  id: string;
}> = async (req, res) => {
  const currentLocation = await prisma.location.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!currentLocation) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Location with this ID does not exist"
    );
  }

  await prisma.location.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.sendStatus(StatusCodes.OK);
};
