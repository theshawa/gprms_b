import { prisma } from "@/prisma";
import { WaiterAssignment } from "@prisma/client";
import { getWaiterAssignments } from "./get-waiter-assignments";

export const getDiningTables = async (
  userId: number,
  assignments: WaiterAssignment[] | undefined = undefined
) => {
  if (!assignments) assignments = await getWaiterAssignments(userId);

  return prisma.diningTable.findMany({
    where: {
      diningAreaId: {
        in: assignments.map((da) => da.diningAreaId),
      },
    },
    orderBy: {
      name: "asc",
    },
    include: {
      diningArea: true,
    },
  });
};
