import { prisma } from "@/prisma";

export const getWaiterAssignments = async (waiterId: number) => {
  return await prisma.waiterAssignment.findMany({
    where: {
      waiterId: waiterId,
    },
    include: {
      diningArea: true,
    },
  });
};
