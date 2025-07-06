import { StaffActivityLog } from "@prisma/client";
import { RequestHandler } from "express";
import { prisma } from "../../../prisma";

export const getActivityLogsHandler: RequestHandler<
  { staffMemberId: string },
  StaffActivityLog[],
  {},
  {}
> = async (req, res) => {
  console.log(
    "Fetching activity logs for staff member ID:",
    req.params.staffMemberId
  );

  const activityLogs = await prisma.staffActivityLog.findMany({
    where: {
      staffMemberId: parseInt(req.params.staffMemberId),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(activityLogs);
};
