import { prisma } from "@/prisma";
import { RequestHandler } from "express";

interface Params {
  id: string;
}

export const deleteClosedDayHandler: RequestHandler<Params> = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Closed day ID is required",
      });
    }

    const closedDayId = parseInt(id, 10);

    if (isNaN(closedDayId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid closed day ID",
      });
    }

    // Check if closed day exists
    const closedDay = await prisma.closedDay.findUnique({
      where: { id: closedDayId },
    });

    if (!closedDay) {
      return res.status(404).json({
        success: false,
        message: "Closed day not found",
      });
    }

    // Delete the closed day
    await prisma.closedDay.delete({
      where: { id: closedDayId },
    });

    return res.status(200).json({
      success: true,
      message: "Closed day deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting closed day:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete closed day",
    });
  }
};
