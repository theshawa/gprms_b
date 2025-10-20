import { RequestHandler } from "express";
import { prisma } from "@/prisma";

export const getClosedDaysHandler: RequestHandler = async (req, res) => {
  try {
    // Get all closed days from today onwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const closedDays = await prisma.closedDay.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        isFullDay: true,
        reason: true,
        description: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: closedDays,
    });
  } catch (error) {
    console.error("Error fetching closed days:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch closed days",
    });
  }
};
