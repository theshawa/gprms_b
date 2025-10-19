import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";
import { sendSMS } from "@/twilio";
import { formatCurrency } from "@/utils/format";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const markOrderPreparedHandler: RequestHandler<
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
      status: "Ready",
    },
    include: {
      orderItems: {
        include: {
          dish: true,
        },
      },
    },
  });

  const itemsText = order.orderItems
    .map(
      (item) =>
        `- ${
          item.quantity
        } of ${item.dish.name.toUpperCase()}: ${formatCurrency(
          item.price
        )} each`
    )
    .join("\n");

  // TODO: Notify kitchen Cashier dashboard
  await publishEvent("order-prepared", { orderId: order.id });

  res.sendStatus(StatusCodes.OK);
};
