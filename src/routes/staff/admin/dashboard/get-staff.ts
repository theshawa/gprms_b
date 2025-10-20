import { prisma } from "@/prisma";
import { Request, Response } from "express";

interface StaffMemberResponse {
  id: number;
  name: string;
  username: string;
  role: string;
}

/**
 * Get all staff members in the system
 * GET /staff/admin/dashboard/staff
 */
export const getStaffMembersHandler = async (req: Request, res: Response) => {
  try {
    const staffMembers = await prisma.staffMember.findMany({
      where: {
        NOT: {
          OR: [
            { id: 1 }, // Exclude initial admin with id 1
            { username: "admin" }, // Exclude admin username
          ],
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
      orderBy: {
        name: "asc", // Sort alphabetically by name
      },
    });

    res.json({
      staffMembers,
      total: staffMembers.length,
    });
  } catch (error) {
    console.error("Error fetching staff members:", error);
    res.status(500).json({
      message: "Failed to fetch staff members",
    });
  }
};
