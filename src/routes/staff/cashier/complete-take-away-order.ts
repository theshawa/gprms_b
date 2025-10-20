import { prisma } from "@/prisma";
import { getSocketIO } from "@/socket/io";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const completeTakeAwayOrderHandler: RequestHandler<
  { id: string },
  {},
  {}
> = async (req, res) => {
  const id = parseInt(req.params.id);

  const takeAwayOrder = await prisma.takeAwayOrder.update({
    where: {
      id,
    },
    data: {
      status: "Completed",
    },
    include: {
      items: {
        include: {
          dish: true,
        },
      },
    },
  });

  // Notify kitchen dashboard
  const io = getSocketIO();
  io.of("/kitchen-manager")
    .to("takeaway-room")
    .emit("takeaway-order-completed", takeAwayOrder);

  res.sendStatus(StatusCodes.OK);
};
