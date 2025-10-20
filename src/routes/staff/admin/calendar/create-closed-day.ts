import { RequestHandler } from "express";
import { prisma } from "@/prisma";
import { z } from "zod";

const createClosedDaySchema = z.object({
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isFullDay: z.boolean(),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
});

type CreateClosedDayBody = z.infer<typeof createClosedDaySchema>;

export const createClosedDayHandler: RequestHandler<
  {},
  {},
  CreateClosedDayBody,
  {}
> = async (req, res) => {
  try {
    const validationResult = createClosedDaySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: validationResult.error.issues,
      });
    }

    const { date, startTime, endTime, isFullDay, reason, description } = validationResult.data;

    // Parse the date
    const closureDate = new Date(date);
    closureDate.setHours(0, 0, 0, 0);

    // For now, we'll use a default admin staff ID (1)
    // In a real implementation, this should come from the authenticated user
    const closedDay = await prisma.closedDay.create({
      data: {
        date: closureDate,
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
    });

    return res.status(201).json({
      success: true,
      message: "Closed day created successfully",
      data: closedDay,
    });
  } catch (error) {
    console.error("Error creating closed day:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create closed day",
    });
  }
};
