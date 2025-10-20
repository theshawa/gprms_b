import { RequestHandler } from "express";
import { prisma } from "@/prisma";

export const getClosedDaysHandler: RequestHandler = async (req, res) => {
  try {
    const closedDays = await prisma.closedDay.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: closedDays,
    });
  } catch (error) {
    console.error("Error fetching closed days:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch closed days",
    });
  }
};
