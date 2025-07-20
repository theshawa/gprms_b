import { prisma } from "@/prisma";
import { Menu } from "@prisma/client";
import { RequestHandler } from "express";

export const getAllMenusHandler: RequestHandler<{}, Menu[]> = async (
  _,
  res
) => {
  const menus = await prisma.menu.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      menuSections: {
        orderBy: {
          position: "asc",
        },
        include: {
          menuItems: {
            orderBy: {
              position: "asc",
            },
            include: {
              dish: {
                include: {
                  ingredients: true,
                },
              },
            },
          },
        },
      },
    },
  });

  res.json(menus);
};
