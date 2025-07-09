import { RequestHandler } from "express";
import { prisma } from "../../../../prisma";

export const getDiningAreasHandler: RequestHandler = async (_, res) => {
  const diningAreas = await prisma.diningArea.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      tables: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  res.json(diningAreas);
};
