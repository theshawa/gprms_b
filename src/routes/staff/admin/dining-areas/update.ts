import { uploadAssetToCloudinary } from "@/cloudinary";
import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { DiningArea } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

// --- Validation schema ---
export const updateDiningAreaHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim().nonempty("Description is required"),
  reservationSeatsCount: z.number().min(0, "Reservation seats count must be at least 0").optional(),
});

export const updateDiningAreaHandler: RequestHandler<
  { id: string },
  DiningArea,
  { data: string }
> = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw new Exception(StatusCodes.BAD_REQUEST, "Invalid dining area ID");
  }

  // --- Validate body ---
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

  // --- Check existence ---
  const currentDiningArea = await prisma.diningArea.findUnique({
    where: { id },
  });
  if (!currentDiningArea) {
    throw new Exception(StatusCodes.NOT_FOUND, `Dining area with ID ${id} not found`);
  }

  // --- Check name conflicts ---
  const duplicate = await prisma.diningArea.findFirst({
    where: {
      name: payload.name.toUpperCase().trim(),
      id: { not: id },
    },
  });
  if (duplicate) {
    throw new Exception(StatusCodes.CONFLICT, "Another dining area with this name already exists");
  }

  let imageUpload = currentDiningArea.image;

  if (req.file) {
    imageUpload = (await uploadAssetToCloudinary(req.file, "dining-areas", `${id}-image`))
      .public_id;
  }

  const area = await prisma.diningArea.update({
    where: { id },
    data: {
      name: payload.name.toUpperCase().trim(),
      description: payload.description.trim(),
      image: imageUpload,
      reservationSeatsCount: payload.reservationSeatsCount,
    },
  });

  // --- Notify via Redis ---
  // await publishEvent("dining-area-updated", id);

  // --- Return final updated area ---
  res.status(StatusCodes.OK).json(area);
};
