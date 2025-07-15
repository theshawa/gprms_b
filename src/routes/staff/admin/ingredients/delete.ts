import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const deleteIngredientHandler: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const currentIngredient = await prisma.ingredient.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });
  if (!currentIngredient) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Ingredient with this ID does not exist"
    );
  }

  await prisma.ingredient.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.sendStatus(StatusCodes.OK);
};
