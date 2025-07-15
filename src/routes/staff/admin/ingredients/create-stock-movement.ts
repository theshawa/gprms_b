import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { IngredientStockMovement } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const createStockMovementHandlerBodySchema = z.object({
  ingredientId: z.number().positive("Ingredient ID must be a positive number"),
  reason: z.string().trim().nonempty("Reason is required"),
  quantity: z.number(),
});

export const createStockMovementHandler: RequestHandler<
  {},
  IngredientStockMovement,
  z.infer<typeof createStockMovementHandlerBodySchema>
> = async (req, res) => {
  const ingredient = await prisma.ingredient.findFirst({
    where: {
      id: req.body.ingredientId,
    },
  });

  if (!ingredient) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Ingredient with this ID does not exist"
    );
  }

  const movement = await prisma.ingredientStockMovement.create({
    data: {
      quantity: req.body.quantity,
      reason: req.body.reason.trim(),
      ingredientId: req.body.ingredientId,
    },
  });

  if (ingredient.stockQuantity + req.body.quantity < 0) {
    throw new Exception(
      StatusCodes.BAD_REQUEST,
      "Insufficient stock for this operation"
    );
  }

  await prisma.ingredient.update({
    where: {
      id: req.body.ingredientId,
    },
    data: {
      stockQuantity: ingredient.stockQuantity + req.body.quantity,
    },
  });

  res.status(201).json(movement);
};
