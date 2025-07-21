import { uploadAssetToCloudinary } from "@/cloudinary";
import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { DiningArea } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const createDiningAreaHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim().nonempty("Description is required"),
});

export const createDiningAreaHandler: RequestHandler<
  {},
  DiningArea,
  { data: string }
> = async (req, res) => {
  const {
    success,
    data: payload,
    error,
  } = createDiningAreaHandlerBodySchema.safeParse(JSON.parse(req.body.data));
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

  const currentDiningArea = await prisma.diningArea.findFirst({
    where: {
      name: payload.name.toUpperCase().trim(),
    },
  });

  if (currentDiningArea) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Dining area with this name already exists"
    );
  }

  let diningArea = await prisma.diningArea.create({
    data: {
      name: payload.name.toUpperCase().trim(),
      description: payload.description.trim(),
      image: "",
    },
  });

  const imageUploadResult = await uploadAssetToCloudinary(
    req.file,
    "dining-areas",
    diningArea.id.toString()
  );

  diningArea = await prisma.diningArea.update({
    where: { id: diningArea.id },
    data: { image: imageUploadResult.public_id },
  });

  res.status(StatusCodes.CREATED).json(diningArea);
};
