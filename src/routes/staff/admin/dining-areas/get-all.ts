import { prisma } from "@/prisma";
import { RequestHandler } from "express";

export const getDiningAreasHandler: RequestHandler = async (_, res) => {
  // await new Promise((res) => setTimeout(res, 1500));
  const diningAreas = await prisma.diningArea.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      diningTables: {
        orderBy: {
          name: "asc",
        },
      },
      assignedWaiters: {
        include: {
          waiter: {
            include: {
              assignedDiningAreas: true,
            },
          },
        },
      },
    },
  });

  res.json(diningAreas);
};
