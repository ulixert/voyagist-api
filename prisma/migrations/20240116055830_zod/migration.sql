/*
  Warnings:

  - You are about to drop the `StartDate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StartDate" DROP CONSTRAINT "StartDate_tourId_fkey";

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "startDates" TIMESTAMP(3)[];

-- DropTable
DROP TABLE "StartDate";
