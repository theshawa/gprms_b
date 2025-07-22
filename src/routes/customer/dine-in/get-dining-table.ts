import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { Meal } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const getDiningTableHandler: RequestHandler<{
  tableId: string;
  time: string;
}> = async (req, res) => {
  const { tableId, time } = req.params;

  const diningTable = await prisma.diningTable.findUnique({
    where: { id: Number(tableId) },
    include: {
      diningArea: true,
    },
  });

  if (!diningTable) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      `Dining table with ID ${tableId} not found`
    );
  }

  const currentTime = new Date(Number(time));

  let meal: Meal; // "Brunch" | "Lunch" | "HighTea" | "Dinner"

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  if (timeInMinutes >= 0 && timeInMinutes < 720) {
    meal = Meal.Brunch; // 00:00 to 11:29
  } else if (timeInMinutes >= 720 && timeInMinutes < 1080) {
    meal = Meal.Lunch; // 11:30 to 15:59
  } else if (timeInMinutes >= 1080 && timeInMinutes < 1320) {
    meal = Meal.HighTea; // 16:00 to 18:59
  } else {
    meal = Meal.Dinner; // 19:00 to 23:59
  }

  let menu = await prisma.menu.findFirst({
    where: {
      meal,
      isActive: true,
    },
    include: {
      menuSections: {
        include: {
          menuItems: {
            include: {
              dish: true,
            },
          },
        },
      },
    },
  });

  if (!menu) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      `No active menu found for meal ${meal}`
    );
  }

  res.json({
    diningTable,
    menu,
  });
};
