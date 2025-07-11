import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { verifyJWTToken } from "@/utils/jwt";
import { StaffMember, StaffRole } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const staffAuthRequiredMiddleware =
  (
    ...roles: StaffRole[]
  ): RequestHandler<{}, {}, {}, {}, { user: StaffMember }> =>
  async (req, res, next) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throw new Exception(StatusCodes.UNAUTHORIZED, "unauthorized access");
    }

    const payload = verifyJWTToken(accessToken, "access");
    if (!payload) {
      throw new Exception(StatusCodes.UNAUTHORIZED, "unauthorized access");
    }

    const user = await prisma.staffMember.findFirst({
      where: {
        id: payload.sub,
      },
      omit: {
        passwordHash: true,
      },
    });

    if (!user) {
      throw new Exception(StatusCodes.UNAUTHORIZED, "unauthorized access");
    }

    if (roles.length && !roles.includes(user.role)) {
      throw new Exception(
        StatusCodes.FORBIDDEN,
        "you do not have permission to access this resource"
      );
    }

    res.locals.user = { ...user, passwordHash: "" };

    next();
  };
