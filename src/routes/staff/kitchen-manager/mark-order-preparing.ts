import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";
import { formatCurrency } from "@/utils/format";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const markOrderPreparingHandler: RequestHandler<
  { id: string },
  {},
  {}
> = async (req, res) => {
  const id = parseInt(req.params.id);

  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      status: "InProgress",
    },
    // include: {
    //   orderItems: {
    //     include: {
    //       dish: true,
    //     },
    //   },
    // },
  });

  // const itemsText = order.orderItems
  //   .map(
  //     (item) =>
  //       `- ${
  //         item.quantity
  //       } of ${item.dish.name.toUpperCase()}: ${formatCurrency(
  //         item.price
  //       )} each`
  //   )
  //   .join("\n");

  // TODO: Notify kitchen Cashier dashboard
  await publishEvent("order-preparing", { orderId: order.id });

  res.sendStatus(StatusCodes.OK);
};
