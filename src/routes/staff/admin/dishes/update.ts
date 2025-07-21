import { uploadAssetToCloudinary } from "@/cloudinary";
import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { Dish } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
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
  {
    image: Express.Multer.File;
    data: string;
  }
> = async (req, res) => {
  const {
    success,
    data: payload,
    error,
  } = updateDishHandlerBodySchema.safeParse(JSON.parse(req.body.data));
  if (!success) {
    const errorMessages = error.issues.map((issue) => issue.message);
    throw new Exception(
      StatusCodes.BAD_REQUEST,
      `Invalid request body: ${errorMessages.join(", ")}`
    );
  }

  const currentDish = await prisma.dish.findUnique({
    where: { id: Number(req.params.dishId) },
  });
  if (!currentDish) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      `Dish with ID ${req.params.dishId} not found`
    );
  }

  const alreadyDish = await prisma.dish.findFirst({
    where: {
      name: payload.name.trim().toLowerCase(),
      id: { not: Number(req.params.dishId) }, // Exclude current dish
    },
  });
  if (alreadyDish) {
    throw new Exception(
      StatusCodes.CONFLICT,
      `Dish with name "${payload.name}" already exists`
    );
  }

  if (req.file) {
    await uploadAssetToCloudinary(
      req.file,
      "dishes",
      currentDish.id.toString()
    );
  }

  // delete all ingredients first
  await prisma.dishIngredient.deleteMany({
    where: { dishId: Number(req.params.dishId) },
  });

  const updatedDish = await prisma.dish.update({
    where: { id: Number(req.params.dishId) },
    data: {
      name: payload.name.trim().toLowerCase(),
      description: payload.description.trim(),
      price: payload.price,
      ingredients: {
        create: payload.ingredients.map((ingredient) => ({
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

  res.json(updatedDish);
};
