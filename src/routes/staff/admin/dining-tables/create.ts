import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { DiningTable } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const createDiningTableHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  diningAreaId: z.number().nonnegative("Dining Area must be positive"),
  isReservable: z.boolean(),
  maxSeats: z.number().gt(0, "Max seats count must be a valid value"),
});

export const createDiningTableHandler: RequestHandler<
  {},
  DiningTable,
  z.infer<typeof createDiningTableHandlerBodySchema>
> = async (req, res) => {
  const currentDiningTable = await prisma.diningTable.findFirst({
    where: {
      name: req.body.name.toUpperCase().trim(),
      diningAreaId: req.body.diningAreaId,
    },
  });

  if (currentDiningTable) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Dining table with this name already exists in this dining area"
    );
  }

  const diningTable = await prisma.diningTable.create({
    data: {
      name: req.body.name.toUpperCase().trim(),
      diningAreaId: req.body.diningAreaId,
      maxSeats: req.body.maxSeats,
      isReservable: req.body.isReservable,
    },
    include: {
      diningArea: true,
    },
  });

  // await publishEvent(
  //   "dining-table-created-in-dining-area",
  //   req.body.diningAreaId
  // );

  res.status(StatusCodes.CREATED).json(diningTable);
};
