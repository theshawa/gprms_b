import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";
import { sendSMS } from "@/twilio";
import { formatCurrency } from "@/utils/format";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const placeOrderHandlerBodySchema = z.object({
  customerPhone: z.string().trim().nonempty("Phone number is required"),
  customerName: z.string().trim().nonempty("Name is required"),
  notes: z.string().trim(),
  items: z
    .array(
      z.object({
        dishId: z.number(),
        quantity: z.number().min(1),
        priceAtOrder: z.number().min(0),
      })
    )
    .min(1, "At least one item is required"),
});

export const placeOrderHandler: RequestHandler<
  {},
  { status: string },
  z.infer<typeof placeOrderHandlerBodySchema>
> = async (req, res) => {
  const { customerName, customerPhone, notes, items } = req.body;

  const takeAwayOrder = await prisma.takeAwayOrder.create({
    data: {
      customerName,
      customerPhone,
      notes,
      totalAmount: items.reduce((acc, item) => acc + item.priceAtOrder * item.quantity, 0),
      items: {
        create: items.map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
          priceAtOrder: item.priceAtOrder,
        })),
      },
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
    to: customerPhone,
    body: `Your take-away order has been placed successfully!\n\nOrder ID: ${
      takeAwayOrder.id
    }\nTotal Amount: ${formatCurrency(takeAwayOrder.totalAmount)}\n\nItems:\n${itemsText}${
      notes ? `\n\nNotes:\n${notes}` : ""
    }\n\nThank you for ordering with RestoEase!`,
    whatsapp: true,
  });

  // TODO: Notify kitchen dashboard, Cashier dashboard
  await publishEvent("takeaway-order-placed", { orderId: takeAwayOrder.id });

  throw new Exception(StatusCodes.BAD_GATEWAY, "Not implemented");

  // res.json(takeAwayOrder);
};
