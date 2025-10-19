import { prisma } from "@/prisma";
import { getSocketIO } from "@/socket/io";
import { sendSMS } from "@/twilio";
import { formatCurrency } from "@/utils/format";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const markakeAwayOrderPreparedHandler: RequestHandler<{ id: string }, {}, {}> = async (
  req,
  res
) => {
  const id = parseInt(req.params.id);

  const takeAwayOrder = await prisma.takeAwayOrder.update({
    where: {
      id,
    },
    data: {
      status: "Prepared",
    },
    include: {
      items: {
        include: {
          dish: true,
        },
      },
    },
  });

  const itemsText = takeAwayOrder.items
    .map(
      (item) =>
        `- ${item.quantity} of ${item.dish.name.toUpperCase()}: ${formatCurrency(
          item.priceAtOrder
        )} each`
    )
    .join("\n");

  await sendSMS({
    to: takeAwayOrder.customerPhone,
    body: `Your take-away order is now ready to pickup!\n\nOrder ID: ${
      takeAwayOrder.id
    }\nTotal Amount: ${formatCurrency(takeAwayOrder.totalAmount)}\n\nItems:\n${itemsText}${
      takeAwayOrder.notes ? `\n\nNotes:\n${takeAwayOrder.notes}` : ""
    }\n\nThank you for ordering with RestoEase!`,
    whatsapp: true,
  });

  // reduce quantity of ingredients used in the order
  for (const item of takeAwayOrder.items) {
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
            reason: `Used in take-away order #${takeAwayOrder.id}`,
          },
        });
      }
    }
  }

  const io = getSocketIO();
  io.of("/cashier").to("takeaway-room").emit("takeaway-order-marked-prepared", takeAwayOrder);

  res.sendStatus(StatusCodes.OK);
};
