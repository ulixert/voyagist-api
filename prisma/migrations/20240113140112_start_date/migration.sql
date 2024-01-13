/*
  Warnings:

  - You are about to drop the column `date` on the `StartDate` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `StartDate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StartDate" DROP COLUMN "date",
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
