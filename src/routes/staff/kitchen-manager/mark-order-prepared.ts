import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";
import { formatCurrency } from "@/utils/format";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const markOrderPreparedHandler: RequestHandler<{ id: string }, {}, {}> = async (
  req,
  res
) => {
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
        `- ${item.quantity} of ${item.dish.name.toUpperCase()}: ${formatCurrency(item.price)} each`
    )
    .join("\n");

  // reduce quantity of ingredients used in the order
  for (const item of order.orderItems) {
    const dish = await prisma.dish.findUnique({
      where: { id: item.dishId },
      include: { ingredients: true },
    });

    if (dish) {
      for (const ingredient of dish.ingredients) {
        await prisma.ingredientStockMovement.create({
          data: {
            quantity: -1 * ingredient.quantity * item.quantity,
            ingredientId: ingredient.ingredientId,
            reason: `Used in dine-in order #${order.id}`,
          },
        });
      }
    }
  }

  // TODO: Notify kitchen Cashier dashboard
  await publishEvent("order-prepared", { orderId: order.id });

  res.sendStatus(StatusCodes.OK);
};
