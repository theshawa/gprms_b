import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";
import { DiningTable } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const updateDiningTableHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  diningAreaId: z.number().nonnegative("Dining Area must be positive"),
  isReservable: z.boolean(),
  maxSeats: z.number().gt(0, "Max seats count must be a valid value"),
});

export const updateDiningTableHandler: RequestHandler<
  { id: string },
  DiningTable,
  z.infer<typeof updateDiningTableHandlerBodySchema>
> = async (req, res) => {
  const currentDiningTable = await prisma.diningTable.findFirst({
    where: {
      name: req.body.name.toUpperCase().trim(),
      diningAreaId: req.body.diningAreaId,
      id: {
        not: parseInt(req.params.id),
      },
    },
  });

  if (currentDiningTable) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Another dining table with this name already exists in this dining area"
    );
  }

  const diningTable = await prisma.diningTable.update({
    data: {
      name: req.body.name.toUpperCase().trim(),
      diningAreaId: req.body.diningAreaId,
      maxSeats: req.body.maxSeats,
      isReservable: req.body.isReservable,
    },
    where: {
      id: parseInt(req.params.id),
    },
    include: {
      diningArea: true,
    },
  });

  await publishEvent(
    "dining-table-updated-in-dining-area",
    req.body.diningAreaId
  );

  res.json(diningTable);
};
