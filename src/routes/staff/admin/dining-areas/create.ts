import { DiningArea } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
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
  const diningArea = await prisma.diningArea.create({
    data: {
      name: req.body.name,
      description: req.body.description,
    },
  });

  res.status(StatusCodes.CREATED).json(diningArea);
};
