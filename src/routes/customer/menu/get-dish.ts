import { RequestHandler } from "express";
import { prisma } from "../../../prisma";

export const getDishHandler: RequestHandler<{ dishId: string }> = async (
  req,
  res
) => {
  console.log("Fetching Dish for Customer");

  const { dishId } = req.params;
  const id = Number(dishId);

  const dish = await prisma.dish.findUnique({
    where: { id },
  });

  res.json(dish);
};
