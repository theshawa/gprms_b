import { Location } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { prisma } from "../../../../prisma";

export const createLocationHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim().nonempty("Description is required"),
});

export const createLocationHandler: RequestHandler<
  {},
  Location,
  z.infer<typeof createLocationHandlerBodySchema>
> = async (req, res) => {
  const location = await prisma.location.create({
    data: {
      name: req.body.name,
      description: req.body.description,
    },
  });

  res.status(StatusCodes.CREATED).json(location);
};
