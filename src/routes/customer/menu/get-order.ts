import { RequestHandler } from "express";
import { prisma } from "../../../prisma";

export const getOrderHandler: RequestHandler<{ orderCode: string }> = async (
  req,
  res
) => {
  console.log("Fetching Order for Customer");

  const { orderCode } = req.params;

  const order = await prisma.order.findFirst({
    where: { orderCode },
    include: {
      orderItems: {
        include: {
          dish: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  res.json(order);
};
