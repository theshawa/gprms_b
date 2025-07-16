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
  z.infer<typeof updateDiningAreaHandlerBodySchema>
> = async (req, res) => {
  const currentDiningArea = await prisma.diningArea.findFirst({
    where: {
      name: req.body.name.toUpperCase().trim(),
      id: {
        not: parseInt(req.params.id),
      },
    },
  });

  if (currentDiningArea) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Another dining area with this name already exists"
    );
  }

  const diningArea = await prisma.diningArea.update({
    data: {
      name: req.body.name.toUpperCase().trim(),
      description: req.body.description.trim(),
    },
    where: {
      id: parseInt(req.params.id),
    },
  });

  await publishEvent("dining-area-updated", parseInt(req.params.id));

  res.status(StatusCodes.OK).json(diningArea);
};
