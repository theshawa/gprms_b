import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { Menu } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const updateMenuHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  meal: z.enum([
    "Breakfast",
    "Brunch",
    "Lunch",
    "HighTea",
    "Dinner",
    "Snack",
    "Supper",
    "LateNight",
  ]),
  description: z.string().trim(),
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
                .min(0, "Position must be a non-negative number"),
            })
          )
          .nonempty("At least one dish is required"),
      })
    )
    .nonempty("At least one section is required"),
});

export const updateMenuHandler: RequestHandler<
  { menuId: string },
  Menu,
  z.infer<typeof updateMenuHandlerBodySchema>
> = async (req, res) => {
  const currentMenu = await prisma.menu.findUnique({
    where: { id: Number(req.params.menuId) },
  });

  if (!currentMenu) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      `Menu with ID ${req.params.menuId} does not exist`
    );
  }

  if (currentMenu.isActive) {
    throw new Exception(StatusCodes.FORBIDDEN, "Cannot update an active menu");
  }

  // delete all menu sections first
  await prisma.menuSection.deleteMany({
    where: { menuId: Number(req.params.menuId) },
  });

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

  const alreadyMenu = await prisma.menu.findFirst({
    where: { name: payload.name, id: { not: Number(req.params.menuId) } },
  });

  if (alreadyMenu) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Menu with this name already exists"
    );
  }

  const existingActiveMenus = await prisma.menu.findMany({
    where: {
      isActive: true,
      meal: payload.meal,
      id: { not: Number(req.params.menuId) },
    },
  });

  const updated = await prisma.menu.update({
    where: {
      id: Number(req.params.menuId),
    },
    data: {
      name: payload.name,
      meal: payload.meal,
      description: payload.description,
      isActive: existingActiveMenus.length === 0,
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
    },
  });

  res.json(updated);
};
