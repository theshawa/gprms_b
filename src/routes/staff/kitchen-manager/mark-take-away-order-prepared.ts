import { prisma } from "@/prisma";
import { getSocketIO } from "@/socket/io";
import { sendSMS } from "@/twilio";
import { formatCurrency } from "@/utils/format";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const markakeAwayOrderPreparedHandler: RequestHandler<
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
        `- ${
          item.quantity
        } of ${item.dish.name.toUpperCase()}: ${formatCurrency(
          item.priceAtOrder
        )} each`
    )
    .join("\n");

  await sendSMS({
    to: takeAwayOrder.customerPhone,
    body: `Your take-away order is now ready to pickup!\n\nOrder ID: ${
      takeAwayOrder.id
    }\nTotal Amount: ${formatCurrency(
      takeAwayOrder.totalAmount
    )}\n\nItems:\n${itemsText}${
      takeAwayOrder.notes ? `\n\nNotes:\n${takeAwayOrder.notes}` : ""
    }\n\nThank you for ordering with RestoEase!`,
    whatsapp: true,
  });

  const io = getSocketIO();
  io.of("/cashier")
    .to("takeaway-room")
    .emit("takeaway-order-marked-prepared", takeAwayOrder);

  res.sendStatus(StatusCodes.OK);
};
