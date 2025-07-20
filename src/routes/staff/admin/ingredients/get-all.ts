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
    include: {
      stockMovements: {
        orderBy: {
          createdAt: "desc",
        },
      },
      dishIngredients: {
        include: {
          dish: true,
          ingredient: true,
        },
      },
    },
  });

  res.json(ingredients);
};
