import { StaffActivityLog } from "@prisma/client";
import { RequestHandler } from "express";
import { prisma } from "../../../prisma";

export const getActivityLogsHandler: RequestHandler<
  { staffMemberId: string },
  { totalCount: number; activities: StaffActivityLog[] },
  {},
  { page?: string; perPage?: string }
> = async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const perPage = parseInt(req.query.perPage || "10");
  const skip = (page - 1) * perPage;

  const totalCount = await prisma.staffActivityLog.count({
    where: {
      staffMemberId: parseInt(req.params.staffMemberId),
    },
  });

  const activities = await prisma.staffActivityLog.findMany({
    where: {
      staffMemberId: parseInt(req.params.staffMemberId),
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: skip,
    take: perPage,
  });

  res.json({ totalCount, activities });
};
