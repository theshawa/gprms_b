import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const deleteStaffMemberHandler: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const currentStaffMember = await prisma.staffMember.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!currentStaffMember) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Staff member with this ID does not exist"
    );
  }

  await prisma.staffMember.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.sendStatus(StatusCodes.OK);
};
