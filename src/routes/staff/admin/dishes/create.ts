import { prisma } from "@/prisma";
import { Dish } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const createDishHandlerBodySchema = z.object({
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

export const createDishHandler: RequestHandler<
  {},
  Dish,
  z.infer<typeof createDishHandlerBodySchema>
> = async (req, res) => {
  const dish = await prisma.dish.create({
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

  res.status(StatusCodes.CREATED).json(dish);
};
