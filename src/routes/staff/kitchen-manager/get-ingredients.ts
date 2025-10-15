import { Ingredient } from "@prisma/client";
import { RequestHandler } from "express";
import { prisma } from "../../../prisma";

export const getIngredientsHandler: RequestHandler<Ingredient[], {}, {}> = async (
  req,
  res
) => {
  console.log("Fetching ingredients");

  const ingredients = await prisma.ingredient.findMany({
    orderBy: {
      name: "asc",
    },
  });

  res.json(ingredients);
};
