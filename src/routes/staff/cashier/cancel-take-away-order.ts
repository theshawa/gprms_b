import { prisma } from "@/prisma";
import { getSocketIO } from "@/socket/io";
import { sendSMS } from "@/twilio";
import { formatCurrency } from "@/utils/format";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const cancelTakeAwayOrderHandler: RequestHandler<
  { id: string },
  {},
  {}
> = async (req, res) => {
  const id = parseInt(req.params.id);

  const takeAwayOrder = await prisma.takeAwayOrder.update({
    where: {
      id,
    },
    data: {
      status: "Cancelled",
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
        `- ${
          item.quantity
        } of ${item.dish.name.toUpperCase()}: ${formatCurrency(
          item.priceAtOrder
        )} each`
    )
    .join("\n");

  await sendSMS({
    to: takeAwayOrder.customerPhone,
    body: `Your take-away order is cancelled!\n\nOrder ID: ${
      takeAwayOrder.id
    }\nTotal Amount: ${formatCurrency(
      takeAwayOrder.totalAmount
    )}\n\nItems:\n${itemsText}${
      takeAwayOrder.notes ? `\n\nNotes:\n${takeAwayOrder.notes}` : ""
    }\n\nThank you for ordering with RestoEase!`,
    whatsapp: true,
  });

  // Notify kitchen dashboard
  const io = getSocketIO();
  io.of("/kitchen-manager")
    .to("takeaway-room")
    .emit("takeaway-order-cancelled", takeAwayOrder);

  res.sendStatus(StatusCodes.OK);
};
