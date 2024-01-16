/*
  Warnings:

  - You are about to drop the column `startDates` on the `tour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tour" DROP COLUMN "startDates";

-- CreateTable
CREATE TABLE "start_date" (
    "id" SERIAL NOT NULL,
    "tourId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "start_date_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "start_date" ADD CONSTRAINT "start_date_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
