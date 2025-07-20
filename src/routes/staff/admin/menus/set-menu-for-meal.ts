import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { Meal } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const setMenuForMealHandlerBodySchema = z.object({
  menuId: z.number().min(1, "Menu ID must be a positive number"),
});

export const setMenuForMealHandler: RequestHandler<
  { meal: Meal },
  void,
  z.infer<typeof setMenuForMealHandlerBodySchema>
> = async (req, res) => {
  const currentMenu = await prisma.menu.findFirst({
    where: {
      id: Number(req.body.menuId),
      meal: req.params.meal,
    },
  });

  if (!currentMenu) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      `Menu for meal ${req.params.meal} with this ID does not exist`
    );
  }

  const existingActiveMenu = await prisma.menu.findFirst({
    where: {
      isActive: true,
      meal: req.params.meal,
    },
  });

  if (existingActiveMenu) {
    await prisma.menu.update({
      where: { id: existingActiveMenu.id },
      data: { isActive: false },
    });
  }

  await prisma.menu.update({
    where: { id: currentMenu.id },
    data: { isActive: true },
  });

  res.sendStatus(StatusCodes.OK);
};
