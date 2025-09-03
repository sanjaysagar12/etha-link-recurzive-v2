/*
  Warnings:

  - You are about to drop the column `poll` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "poll",
ADD COLUMN     "thumbnail" TEXT;
