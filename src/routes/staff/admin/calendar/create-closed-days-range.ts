import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { z } from "zod";

const createClosedDaysRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isFullDay: z.boolean(),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
});

type CreateClosedDaysRangeBody = z.infer<typeof createClosedDaysRangeSchema>;

export const createClosedDaysRangeHandler: RequestHandler<
  {},
  {},
  CreateClosedDaysRangeBody,
  {}
> = async (req, res) => {
  try {
    const validationResult = createClosedDaysRangeSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: validationResult.error.issues,
      });
    }

    const {
      startDate,
      endDate,
      startTime,
      endTime,
      isFullDay,
      reason,
      description,
    } = validationResult.data;

    // Parse dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before or equal to end date",
      });
    }

    // Generate all dates in the range
    const datesToClose = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      datesToClose.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // For now, we'll use a default admin staff ID (1)
    // Create closed days for each date
    const closedDays = await Promise.all(
      datesToClose.map((date) =>
        prisma.closedDay.create({
          data: {
            date,
            startTime: isFullDay ? null : startTime,
            endTime: isFullDay ? null : endTime,
            isFullDay,
            reason,
            description: description || null,
            createdById: 1, // Default admin ID
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: `Successfully closed ${closedDays.length} day(s)`,
      data: closedDays,
    });
  } catch (error) {
    console.error("Error creating closed days range:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create closed days",
    });
  }
};
