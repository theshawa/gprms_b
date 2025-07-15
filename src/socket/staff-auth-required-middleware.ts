import { prisma } from "@/prisma";
import { verifyJWTToken } from "@/utils/jwt";
import { StaffRole } from "@prisma/client";
import { Socket } from "socket.io";

export const staffAuthRequiredMiddleware =
  (...roles: StaffRole[]) =>
  async (socket: Socket, next: (err?: Error) => void) => {
    const accessToken = socket.handshake.auth.token;

    if (!accessToken) {
      return next(new Error("Authentication error: No token provided"));
    }

    const payload = verifyJWTToken(accessToken, "access");
    if (!payload) {
      return next(new Error("Authentication error: Invalid token"));
    }

    const user = await prisma.staffMember.findFirst({
      where: {
        id: payload.sub,
      },
      omit: {
        passwordHash: true,
      },
      include: {
        assignedDiningAreas: {
          include: {
            diningArea: true,
          },
        },
      },
    });

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    if (roles.length && !roles.includes(user.role)) {
      return next(new Error("Authentication error: Insufficient permissions"));
    }

    socket.data.user = { ...user, passwordHash: "" };

    next();
  };
