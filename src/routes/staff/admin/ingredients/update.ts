import { prisma } from "@/prisma";
import { Ingredient } from "@prisma/client";
import { RequestHandler } from "express";
import z from "zod";

export const updateIngredientHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim(),
  costPerUnit: z.number().min(0, "Cost per unit must be a non-negative number"),
  unit: z.string().trim().nonempty("Unit is required"),
  lowStockThreshold: z
    .number()
    .int()
    .min(0, "Low stock threshold must be a non-negative integer"),
});

export const updateIngredientHandler: RequestHandler<
  { id: string },
  Ingredient,
  z.infer<typeof updateIngredientHandlerBodySchema>
> = async (req, res) => {
  const ingredient = await prisma.ingredient.update({
    data: {
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      costPerUnit: req.body.costPerUnit,
      unit: req.body.unit.trim(),
      lowStockThreshold: req.body.lowStockThreshold,
    },
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.json(ingredient);
};
