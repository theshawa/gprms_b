import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";

export const placeOrderHandler = async (req: any, res: any) => {
  const { customerId, items, totalAmount, notes } = req.body;

  const order = await prisma.order.create({
    data: {
      orderCode: `ORD-${Date.now()}`,
      status: "New",
      totalAmount,
      notes,
      ...(customerId && customerId !== 0
        ? { customer: { connect: { id: customerId } } }
        : {}),
      orderItems: {
        create: items.map((i: any) => ({
          dishId: i.dishId,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
    include: { orderItems: true },
  });

  await publishEvent("order-placed", { orderId: order.id });

  res.status(201).json(order);
};
