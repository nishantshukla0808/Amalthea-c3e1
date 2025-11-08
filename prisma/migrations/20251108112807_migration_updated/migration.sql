/*
  Warnings:

  - Made the column `employeeId` on table `employees` required. This step will fail if there are existing NULL values in that column.
  - Made the column `joiningYear` on table `employees` required. This step will fail if there are existing NULL values in that column.
  - Made the column `loginId` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mustChangePassword` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `employees` MODIFY `employeeId` VARCHAR(191) NOT NULL,
    MODIFY `joiningYear` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `loginId` VARCHAR(191) NOT NULL,
    MODIFY `mustChangePassword` BOOLEAN NOT NULL DEFAULT true;
