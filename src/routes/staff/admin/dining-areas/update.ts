import { DiningArea } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { prisma } from "../../../../prisma";

export const updateDiningAreaHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim().nonempty("Description is required"),
});

export const updateDiningAreaHandler: RequestHandler<
  { id: string },
  DiningArea,
  z.infer<typeof updateDiningAreaHandlerBodySchema>
> = async (req, res) => {
  const diningArea = await prisma.diningArea.update({
    data: {
      name: req.body.name,
      description: req.body.description,
    },
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.status(StatusCodes.OK).json(diningArea);
};
