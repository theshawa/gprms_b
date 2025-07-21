import { uploadAssetToCloudinary } from "@/cloudinary";
import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";
import { DiningArea } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const updateDiningAreaHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim().nonempty("Description is required"),
});

export const updateDiningAreaHandler: RequestHandler<
  { id: string },
  DiningArea,
  { data: string }
> = async (req, res) => {
  const {
    success,
    data: payload,
    error,
  } = updateDiningAreaHandlerBodySchema.safeParse(JSON.parse(req.body.data));
  if (!success) {
    const errorMessages = error.issues.map((issue) => issue.message);
    throw new Exception(
      StatusCodes.BAD_REQUEST,
      `Invalid request body: ${errorMessages.join(", ")}`
    );
  }

  const currentDiningArea = await prisma.diningArea.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  if (!currentDiningArea) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      `Dining area with ID ${req.params.id} not found`
    );
  }

  const alreadyDiningArea = await prisma.diningArea.findFirst({
    where: {
      name: payload.name.toUpperCase().trim(),
      id: {
        not: parseInt(req.params.id),
      },
    },
  });

  if (alreadyDiningArea) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Another dining area with this name already exists"
    );
  }

  if (req.file) {
    await uploadAssetToCloudinary(
      req.file,
      "dining-areas",
      currentDiningArea.id.toString()
    );
  }

  const diningArea = await prisma.diningArea.update({
    data: {
      name: payload.name.toUpperCase().trim(),
      description: payload.description.trim(),
    },
    where: {
      id: parseInt(req.params.id),
    },
  });

  await publishEvent("dining-area-updated", parseInt(req.params.id));

  res.json(diningArea);
};
