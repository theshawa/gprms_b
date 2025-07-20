import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const deleteMenuHandler: RequestHandler<{ menuId: string }> = async (
  req,
  res
) => {
  const currentMenu = await prisma.menu.findFirst({
    where: {
      id: Number(req.params.menuId),
    },
  });
  if (!currentMenu) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Menu with this ID does not exist"
    );
  }

  if (currentMenu.isActive) {
    throw new Exception(StatusCodes.FORBIDDEN, "Cannot delete an active menu");
  }

  await prisma.menu.delete({
    where: { id: Number(req.params.menuId) },
  });

  res.sendStatus(StatusCodes.OK);
};
