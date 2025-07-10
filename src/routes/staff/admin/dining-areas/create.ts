import { DiningArea } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { Exception } from "../../../../lib/exception";
import { prisma } from "../../../../prisma";

export const createDiningAreaHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim().nonempty("Description is required"),
});

export const createDiningAreaHandler: RequestHandler<
  {},
  DiningArea,
  z.infer<typeof createDiningAreaHandlerBodySchema>
> = async (req, res) => {
  const currentDiningArea = await prisma.diningArea.findFirst({
    where: {
      name: req.body.name.toUpperCase().trim(),
    },
  });

  if (currentDiningArea) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Dining area with this name already exists"
    );
  }

  const diningArea = await prisma.diningArea.create({
    data: {
      name: req.body.name.toUpperCase().trim(),
      description: req.body.description.trim(),
    },
  });

  res.status(StatusCodes.CREATED).json(diningArea);
};
