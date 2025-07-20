import { prisma } from "@/prisma";
import { Dish } from "@prisma/client";
import { RequestHandler } from "express";

export const getAllDishesHandler: RequestHandler<{}, Dish[]> = async (
  req,
  res
) => {
  const dishes = await prisma.dish.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: true,
          dish: true,
        },
      },
    },
  });

  res.json(dishes);
};
