import { prisma } from "@/prisma";
import { RequestHandler } from "express";

export const getAllDishesHandler: RequestHandler = async (_, res) => {
  // await new Promise((res) => setTimeout(res, 1500));
  const dishes = await prisma.dish.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      ingredients: true,
      menuItems: true,
    },
  });

  res.json(dishes);
};
