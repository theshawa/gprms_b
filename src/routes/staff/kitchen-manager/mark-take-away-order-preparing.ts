import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";
import { sendSMS } from "@/twilio";
import { formatCurrency } from "@/utils/format";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const markTakeAwayOrderPreparingHandler: RequestHandler<{ id: string }, {}, {}> = async (
  req,
  res
) => {
  const id = parseInt(req.params.id);

  const takeAwayOrder = await prisma.takeAwayOrder.update({
    where: {
      id,
    },
    data: {
      status: "Preparing",
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
    body: `Your take-away order is being prepared!\n\nOrder ID: ${
      takeAwayOrder.id
    }\nTotal Amount: ${formatCurrency(takeAwayOrder.totalAmount)}\n\nItems:\n${itemsText}${
      takeAwayOrder.notes ? `\n\nNotes:\n${takeAwayOrder.notes}` : ""
    }\n\nThank you for ordering with RestoEase!`,
    whatsapp: true,
  });

  // TODO: Notify kitchen Cashier dashboard
  await publishEvent("takeaway-order-preparing", { orderId: takeAwayOrder.id });

  res.sendStatus(StatusCodes.OK);
};
