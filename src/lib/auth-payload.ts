import { StaffRole } from "@prisma/client";

export interface AuthPayload {
  sub: number;
  username: string;
  role: StaffRole;
}
