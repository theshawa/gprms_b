import { uploadAssetToCloudinary } from "@/cloudinary";
import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { Dish } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const createDishHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim().nonempty("Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  imageUrl: z.string().url("Image URL must be a valid URL").optional(),
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
  { image: Express.Multer.File; data: string }
> = async (req, res) => {
  const {
    success,
    data: payload,
    error,
  } = createDishHandlerBodySchema.safeParse(JSON.parse(req.body.data));
  if (!success) {
    const errorMessages = error.issues.map((issue) => issue.message);
    throw new Exception(
      StatusCodes.BAD_REQUEST,
      `Invalid request body: ${errorMessages.join(", ")}`
    );
  }

  if (!req.file) {
    throw new Exception(StatusCodes.BAD_REQUEST, "Image file is required");
  }

  const alreadyDish = await prisma.dish.findFirst({
    where: {
      name: payload.name.trim().toLowerCase(),
    },
  });
  if (alreadyDish) {
    throw new Exception(
      StatusCodes.CONFLICT,
      `Dish with name "${payload.name}" already exists`
    );
  }

  let dish = await prisma.dish.create({
    data: {
      name: payload.name.trim().toLowerCase(),
      description: payload.description.trim(),
      price: payload.price,
      image: "",
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

  const result = await uploadAssetToCloudinary(
    req.file,
    "dishes",
    dish.id.toString()
  );

  dish = await prisma.dish.update({
    where: { id: dish.id },
    data: { image: result.public_id },
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
