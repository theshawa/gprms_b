-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('Admin', 'Cashier', 'Waiter', 'KitchenManager');

-- CreateEnum
CREATE TYPE "OrderStatusType" AS ENUM ('New', 'InProgress', 'Completed', 'Rejected');

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffActivityLog" (
    "id" SERIAL NOT NULL,
    "staffMemberId" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderCode" TEXT NOT NULL,
    "status" "OrderStatusType" NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiningArea" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "DiningArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiningTable" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "diningAreaId" INTEGER NOT NULL,
    "isReservable" BOOLEAN NOT NULL DEFAULT true,
    "maxSeats" INTEGER NOT NULL,

    CONSTRAINT "DiningTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaiterAssignment" (
    "id" SERIAL NOT NULL,
    "diningAreaId" INTEGER NOT NULL,
    "waiterId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaiterAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_username_key" ON "StaffMember"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "DiningArea_name_key" ON "DiningArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DiningTable_name_diningAreaId_key" ON "DiningTable"("name", "diningAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "WaiterAssignment_diningAreaId_waiterId_key" ON "WaiterAssignment"("diningAreaId", "waiterId");

-- AddForeignKey
ALTER TABLE "StaffActivityLog" ADD CONSTRAINT "StaffActivityLog_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiningTable" ADD CONSTRAINT "DiningTable_diningAreaId_fkey" FOREIGN KEY ("diningAreaId") REFERENCES "DiningArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaiterAssignment" ADD CONSTRAINT "WaiterAssignment_diningAreaId_fkey" FOREIGN KEY ("diningAreaId") REFERENCES "DiningArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaiterAssignment" ADD CONSTRAINT "WaiterAssignment_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
