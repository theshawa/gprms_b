import { RequestHandler } from "express";
import { prisma } from "../../../../prisma";

export const getAllDiningTablesHandler: RequestHandler = async (_, res) => {
  const diningTables = await prisma.diningTable.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      diningArea: true,
    },
  });

  res.json(diningTables);
};
