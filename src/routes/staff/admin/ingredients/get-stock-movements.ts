import { prisma } from "@/prisma";
import { IngredientStockMovement } from "@prisma/client";
import { RequestHandler } from "express";

export const getStockMovementsHandler: RequestHandler<
  { ingredientId: string },
  { totalCount: number; movements: IngredientStockMovement[] },
  {},
  { page?: string; perPage?: string }
> = async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const perPage = parseInt(req.query.perPage || "10");
  const skip = (page - 1) * perPage;

  const totalCount = await prisma.ingredientStockMovement.count({
    where: {
      ingredientId: parseInt(req.params.ingredientId),
    },
  });

  const movements = await prisma.ingredientStockMovement.findMany({
    where: {
      ingredientId: parseInt(req.params.ingredientId),
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: skip,
    take: perPage,
    include: {
      ingredient: {
        include: {
          dishIngredients: {
            include: {
              dish: true,
              ingredient: true,
            },
          },
        },
      },
    },
  });

  res.json({ totalCount, movements });
};
