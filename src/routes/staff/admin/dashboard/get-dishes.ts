import { prisma } from "@/prisma";
import { Request, Response } from "express";

interface DishResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

/**
 * Get all dishes in the system
 * GET /staff/admin/dashboard/dishes
 */
export const getDishesHandler = async (req: Request, res: Response) => {
  try {
    const dishes = await prisma.dish.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
      },
      orderBy: {
        name: "asc", // Sort alphabetically by name
      },
    });

    res.json({
      dishes,
      total: dishes.length,
    });
  } catch (error) {
    console.error("Error fetching dishes:", error);
    res.status(500).json({
      message: "Failed to fetch dishes",
    });
  }
};
