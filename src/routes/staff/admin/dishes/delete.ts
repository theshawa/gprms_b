import { deleteAssetFromCloudinary } from "@/cloudinary";
import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const deleteDishHandler: RequestHandler<{ dishId: string }> = async (
  req,
  res
) => {
  const currentDish = await prisma.dish.findFirst({
    where: {
      id: Number(req.params.dishId),
    },
  });
  if (!currentDish) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Dish with this ID does not exist"
    );
  }

  if (currentDish.image) {
    await deleteAssetFromCloudinary(currentDish.image);
  }

  await prisma.dish.delete({
    where: { id: Number(req.params.dishId) },
  });

  res.sendStatus(StatusCodes.OK);
};
