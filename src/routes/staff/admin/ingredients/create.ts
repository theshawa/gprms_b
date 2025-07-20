import { prisma } from "@/prisma";
import { Ingredient } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const createIngredientHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim(),
  costPerUnit: z.number().min(0, "Cost per unit must be a non-negative number"),
  unit: z.string().trim().nonempty("Unit is required"),
  initialQuantity: z
    .number()
    .min(0, "Initial quantity must be a non-negative number"),
  lowStockThreshold: z
    .number()
    .int()
    .min(0, "Low stock threshold must be a non-negative integer"),
});

export const createIngredientHandler: RequestHandler<
  {},
  Ingredient,
  z.infer<typeof createIngredientHandlerBodySchema>
> = async (req, res) => {
  const ingredient = await prisma.ingredient.create({
    data: {
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      costPerUnit: req.body.costPerUnit,
      unit: req.body.unit.trim(),
      stockQuantity: req.body.initialQuantity,
      lowStockThreshold: req.body.lowStockThreshold,
    },
  });

  res.status(StatusCodes.CREATED).json(ingredient);
};
