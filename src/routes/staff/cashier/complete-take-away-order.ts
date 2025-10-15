import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const completeTakeAwayOrderHandler: RequestHandler<{ id: string }, {}, {}> = async (
  req,
  res
) => {
  const id = parseInt(req.params.id);

  await prisma.takeAwayOrder.update({
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

  res.sendStatus(StatusCodes.OK);
};
