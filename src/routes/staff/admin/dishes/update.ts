import { prisma } from "@/prisma";
import { Dish } from "@prisma/client";
import { RequestHandler } from "express";
import z from "zod";

export const updateDishHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim().nonempty("Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  ingredients: z.array(
    z.object({
      id: z.number().nonnegative("Ingredient ID must be positive"),
      quantity: z.number().min(0, "Quantity must be a positive number"),
    })
  ),
});

export const updateDishHandler: RequestHandler<
  { dishId: string },
  Dish,
  z.infer<typeof updateDishHandlerBodySchema>
> = async (req, res) => {
  // delete all ingredients first
  await prisma.dishIngredient.deleteMany({
    where: { dishId: Number(req.params.dishId) },
  });

  const dish = await prisma.dish.update({
    where: { id: Number(req.params.dishId) },
    data: {
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      price: req.body.price,
      ingredients: {
        create: req.body.ingredients.map((ingredient) => ({
          ingredientId: ingredient.id,
          quantity: ingredient.quantity,
        })),
      },
    },
    include: {
      ingredients: {
        include: {
          ingredient: true,
          dish: true,
        },
      },
    },
  });

  res.json(dish);
};
