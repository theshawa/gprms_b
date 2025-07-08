import { RequestHandler } from "express";
import { prisma } from "../../../../prisma";

export const getLocationsHandler: RequestHandler = async (_, res) => {
  const locations = await prisma.location.findMany({
    orderBy: {
      name: "asc",
    },
  });

  res.json(locations);
};
