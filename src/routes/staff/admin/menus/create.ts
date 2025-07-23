import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { Menu } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const createMenuHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  description: z.string().trim(),
  meal: z.enum(["Brunch", "Lunch", "HighTea", "Dinner"]),
  menuSections: z
    .array(
      z.object({
        name: z.string().trim().nonempty("Section name is required"),
        description: z.string().trim(),
        position: z.number().min(0, "Position must be a non-negative number"),
        menuItems: z
          .array(
            z.object({
              dishId: z.number().positive("Dish ID must be a positive number"),
              position: z
                .number()
                .min(0, "Price must be a non-negative number"),
            })
          )
          .nonempty("At least one dish is required"),
      })
    )
    .nonempty("At least one section is required"),
});

export const createMenuHandler: RequestHandler<
  {},
  Menu,
  z.infer<typeof createMenuHandlerBodySchema>
> = async (req, res) => {
  const payload = {
    name: req.body.name.trim().toLowerCase(),
    meal: req.body.meal,
    description: req.body.description.trim(),
    menuSections: req.body.menuSections.map((section) => ({
      name: section.name.trim(),
      description: section.description.trim(),
      position: section.position,
      menuItems: section.menuItems,
    })),
  };

  const currentMenu = await prisma.menu.findFirst({
    where: { name: payload.name },
  });
  if (currentMenu) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Menu with this name already exists"
    );
  }

  const existingActiveMenus = await prisma.menu.findMany({
    where: { isActive: true, meal: payload.meal },
  });

  const menu = await prisma.menu.create({
    data: {
      name: payload.name,
      meal: payload.meal,
      description: payload.description,
      menuSections: {
        create: payload.menuSections.map((section) => ({
          name: section.name,
          description: section.description,
          position: section.position,
          menuItems: {
            create: section.menuItems,
          },
        })),
      },
      isActive: existingActiveMenus.length === 0, // Activate this menu if no other active menus exist
    },
  });

  res.status(StatusCodes.CREATED).json(menu);
};
