import { Location } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { prisma } from "../../../../prisma";

export const updateLocationHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim().nonempty("Description is required"),
});

export const updateLocationHandler: RequestHandler<
  { id: string },
  Location,
  z.infer<typeof updateLocationHandlerBodySchema>
> = async (req, res) => {
  const location = await prisma.location.update({
    data: {
      name: req.body.name,
      description: req.body.description,
    },
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.status(StatusCodes.OK).json(location);
};
