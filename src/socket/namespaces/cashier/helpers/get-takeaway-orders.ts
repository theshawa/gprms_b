import { prisma } from "@/prisma";
import { TakeAwayOrderStatusType } from "@prisma/client";

export const getTakeAwayOrders = async (status: TakeAwayOrderStatusType[]) => {
  return prisma.takeAwayOrder.findMany({
    where: {
      status: {
        in: status,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          dish: true,
        },
      },
    },
  });
};
