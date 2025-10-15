import { Dish } from "@prisma/client";
import { RequestHandler } from "express";
import { prisma } from "../../../prisma";

export const getDishsHandler: RequestHandler<Dish[], {}, {}> = async (
  req,
  res
) => {
  console.log("Fetching Dishes");

  const dishes = await prisma.dish.findMany({
    orderBy: {
      name: "asc",
    },
  });

  res.json(dishes);
};
