import { prisma } from "@/prisma";
import { DiningArea } from "@prisma/client";
import { RequestHandler } from "express";

export const getReservationsByPhoneHandler: RequestHandler<{}, DiningArea[], {}> = async (
  _,
  res
) => {
  const diningAreas = await prisma.diningArea.findMany({
    where: {
      reservationSeatsCount: {
        gt: 0,
      },
    },
    include: {
      reservations: true,
    },
  });

  res.json(diningAreas);
};
