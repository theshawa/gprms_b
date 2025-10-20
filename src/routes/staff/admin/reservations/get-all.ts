import { prisma } from "@/prisma";
import { RequestHandler } from "express";

export const getAllReservationsHandler: RequestHandler<{}, {}, {}, {}> = async (
  req,
  res
) => {
  const reservations = await prisma.reservation.findMany({
    orderBy: {
      reservationDate: "desc",
    },
    include: {
      diningArea: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json(reservations);
};
