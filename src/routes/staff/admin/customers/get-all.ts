import { prisma } from "@/prisma";
import { RequestHandler } from "express";

export const getAllCustomersHandler: RequestHandler<{}, {}, {}, {}> = async (
  req,
  res
) => {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      loyaltyPoints: true,
      createdAt: true,
    },
  });

  res.json(customers);
};
