import { prisma } from "@/prisma";
import { Ingredient } from "@prisma/client";
import { RequestHandler } from "express";

export const getAllIngredientsHandler: RequestHandler<
  {},
  Ingredient[]
> = async (_, res) => {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: {
      name: "asc",
    },
  });
  res.status(200).json(ingredients);
};
