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

  const filteredDiningAreas = diningAreas.filter(
    (area) =>
      area.reservationSeatsCount > area.reservations.reduce((acc, curr) => acc + curr.noOfSeats, 0)
  );

  res.json(filteredDiningAreas);
};
