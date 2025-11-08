-- AlterTable
ALTER TABLE `employees` ADD COLUMN `employeeId` VARCHAR(191) NULL,
    ADD COLUMN `joiningYear` INTEGER NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `lastPasswordChange` DATETIME(3) NULL,
    ADD COLUMN `loginId` VARCHAR(191) NULL,
    ADD COLUMN `mustChangePassword` BOOLEAN NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `employees_employeeId_key` ON `employees`(`employeeId`);

-- CreateIndex
CREATE INDEX `employees_employeeId_idx` ON `employees`(`employeeId`);

-- CreateIndex
CREATE INDEX `employees_joiningYear_idx` ON `employees`(`joiningYear`);

-- CreateIndex
CREATE UNIQUE INDEX `users_loginId_key` ON `users`(`loginId`);

-- CreateIndex
CREATE INDEX `users_loginId_idx` ON `users`(`loginId`);
