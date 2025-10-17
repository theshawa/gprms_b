import { prisma } from "@/prisma";
import { ReservationStatus } from "@prisma/client";
import { RequestHandler } from "express";

export const completeReservationHandler: RequestHandler<{ id: string }> = async (req, res) => {
  const reservationId = parseInt(req.params.id);

  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: ReservationStatus.Completed,
    },
  });

  res.sendStatus(200);
};
