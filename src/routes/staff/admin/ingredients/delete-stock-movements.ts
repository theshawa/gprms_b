import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const deleteStockMovementsHandler: RequestHandler<{
  ingredientId: string;
}> = async (req, res) => {
  await prisma.ingredientStockMovement.deleteMany({
    where: {
      ingredientId: parseInt(req.params.ingredientId),
    },
  });

  res.sendStatus(StatusCodes.OK);
};
