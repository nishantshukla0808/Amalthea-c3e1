/*
  Warnings:

  - You are about to drop the column `finalizedAt` on the `payruns` table. All the data in the column will be lost.
  - You are about to drop the column `finalizedBy` on the `payruns` table. All the data in the column will be lost.
  - You are about to drop the column `totalGross` on the `payruns` table. All the data in the column will be lost.
  - You are about to drop the column `totalNet` on the `payruns` table. All the data in the column will be lost.
  - The values [FINALIZED] on the enum `payruns_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `allowances` on the `payslips` table. All the data in the column will be lost.
  - You are about to drop the column `leaveDays` on the `payslips` table. All the data in the column will be lost.
  - You are about to drop the column `pfDeduction` on the `payslips` table. All the data in the column will be lost.
  - You are about to drop the column `totalDays` on the `payslips` table. All the data in the column will be lost.
  - You are about to drop the column `allowances` on the `salary_structures` table. All the data in the column will be lost.
  - You are about to drop the column `deductions` on the `salary_structures` table. All the data in the column will be lost.
  - You are about to drop the column `pfContribution` on the `salary_structures` table. All the data in the column will be lost.
  - Added the required column `payPeriodEnd` to the `payruns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payPeriodStart` to the `payruns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeCode` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeName` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixedAllowance` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaveTravelAllowance` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payPeriodEnd` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payPeriodStart` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performanceBonus` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pfEmployee` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pfEmployer` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `standardAllowance` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDaysInMonth` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workingDaysInMonth` to the `payslips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixedAllowance` to the `salary_structures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaveTravelAllowance` to the `salary_structures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyWage` to the `salary_structures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performanceBonus` to the `salary_structures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `standardAllowance` to the `salary_structures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `actualHours` DOUBLE NULL,
    ADD COLUMN `breakTime` DOUBLE NULL;

-- AlterTable
ALTER TABLE `employees` ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `uanNumber` VARCHAR(191) NULL;

-- AlterTable - Payruns
-- First add new columns with defaults
ALTER TABLE `payruns` 
    ADD COLUMN `employeeCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `paidBy` VARCHAR(191) NULL,
    ADD COLUMN `payDate` DATE NULL,
    ADD COLUMN `totalBasicWage` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalEmployerCost` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalGrossWage` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalNetWage` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `validatedAt` DATETIME(3) NULL,
    ADD COLUMN `validatedBy` VARCHAR(191) NULL,
    ADD COLUMN `warnings` TEXT NULL;

-- Add date columns with temporary default, then update
ALTER TABLE `payruns` 
    ADD COLUMN `payPeriodStart` DATE NOT NULL DEFAULT '2025-01-01',
    ADD COLUMN `payPeriodEnd` DATE NOT NULL DEFAULT '2025-01-31';

-- Update existing rows to set proper dates based on month/year
UPDATE `payruns` SET 
    `payPeriodStart` = DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01')),
    `payPeriodEnd` = LAST_DAY(DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01')));

-- Update status enum (FINALIZED -> VALIDATED)
UPDATE `payruns` SET `status` = 'VALIDATED' WHERE `status` = 'FINALIZED';
ALTER TABLE `payruns` MODIFY `status` ENUM('DRAFT', 'PROCESSING', 'VALIDATED', 'PAID') NOT NULL DEFAULT 'DRAFT';

-- Drop old columns
ALTER TABLE `payruns` 
    DROP COLUMN `finalizedAt`,
    DROP COLUMN `finalizedBy`,
    DROP COLUMN `totalGross`,
    DROP COLUMN `totalNet`;

-- AlterTable - Payslips
-- Add new columns with defaults
ALTER TABLE `payslips` 
    ADD COLUMN `absentDays` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `attendanceDays` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `bankAccountNo` VARCHAR(191) NULL,
    ADD COLUMN `dateOfJoining` DATE NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `holidayDays` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `ifscCode` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `netSalaryWords` TEXT NULL,
    ADD COLUMN `paidLeaveDays` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `panNumber` VARCHAR(191) NULL,
    ADD COLUMN `payDate` DATE NULL,
    ADD COLUMN `pdfGenerated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `ratePercentage` DOUBLE NOT NULL DEFAULT 100,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `tdsDeduction` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `uanNumber` VARCHAR(191) NULL,
    ADD COLUMN `unpaidLeaveDays` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `workedDays` DOUBLE NOT NULL DEFAULT 0;

-- Add columns that need data from employees (with temp defaults)
ALTER TABLE `payslips`
    ADD COLUMN `employeeCode` VARCHAR(191) NOT NULL DEFAULT 'TEMP',
    ADD COLUMN `employeeName` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    ADD COLUMN `totalDaysInMonth` INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN `workingDaysInMonth` INTEGER NOT NULL DEFAULT 22;

-- Add salary component columns (with temp defaults)
ALTER TABLE `payslips`
    ADD COLUMN `standardAllowance` DOUBLE NOT NULL DEFAULT 4167,
    ADD COLUMN `performanceBonus` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `leaveTravelAllowance` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `fixedAllowance` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `pfEmployee` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `pfEmployer` DOUBLE NOT NULL DEFAULT 0;

-- Add date columns with temp defaults
ALTER TABLE `payslips`
    ADD COLUMN `payPeriodStart` DATE NOT NULL DEFAULT '2025-01-01',
    ADD COLUMN `payPeriodEnd` DATE NOT NULL DEFAULT '2025-01-31';

-- Update existing payslips with calculated values from employees
UPDATE `payslips` p
INNER JOIN `employees` e ON p.employeeId = e.id
SET 
    p.employeeCode = e.employeeId,
    p.employeeName = CONCAT(e.firstName, ' ', e.lastName),
    p.department = e.department,
    p.designation = e.designation,
    p.location = e.location,
    p.panNumber = e.panNumber,
    p.uanNumber = e.uanNumber,
    p.bankAccountNo = e.bankAccountNo,
    p.ifscCode = e.ifscCode,
    p.dateOfJoining = e.dateOfJoining;

-- Update date periods based on month/year
UPDATE `payslips` SET 
    `payPeriodStart` = DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01')),
    `payPeriodEnd` = LAST_DAY(DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01'))),
    `totalDaysInMonth` = DAY(LAST_DAY(DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01'))));

-- Calculate components from existing data
UPDATE `payslips` SET
    `pfEmployee` = COALESCE(`pfDeduction`, ROUND(`basicSalary` * 0.12, 2)),
    `pfEmployer` = ROUND(`basicSalary` * 0.12, 2),
    `performanceBonus` = ROUND(`basicSalary` * 0.0833, 2),
    `leaveTravelAllowance` = ROUND(`basicSalary` * 0.0833, 2),
    `fixedAllowance` = GREATEST(0, `allowances` - 4167 - ROUND(`basicSalary` * 0.0833, 2) - ROUND(`basicSalary` * 0.0833, 2)),
    `workedDays` = COALESCE(`payableDays`, 22),
    `attendanceDays` = COALESCE(`payableDays`, 22) - COALESCE(`leaveDays`, 0);

-- Drop old columns
ALTER TABLE `payslips` 
    DROP COLUMN `allowances`,
    DROP COLUMN `leaveDays`,
    DROP COLUMN `pfDeduction`,
    DROP COLUMN `totalDays`;

-- Modify columns
ALTER TABLE `payslips` MODIFY `payableDays` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `payslips` ALTER COLUMN `professionalTax` DROP DEFAULT;

-- AlterTable - Salary Structures
-- Add new columns with defaults first
ALTER TABLE `salary_structures` 
    ADD COLUMN `basicPercentage` DOUBLE NOT NULL DEFAULT 50.0,
    ADD COLUMN `hraPercentage` DOUBLE NOT NULL DEFAULT 50.0,
    ADD COLUMN `ltaPercentage` DOUBLE NOT NULL DEFAULT 8.33,
    ADD COLUMN `performanceBonusPercent` DOUBLE NOT NULL DEFAULT 8.33,
    ADD COLUMN `pfPercentage` DOUBLE NOT NULL DEFAULT 12.0,
    ADD COLUMN `professionalTax` DOUBLE NOT NULL DEFAULT 200.0,
    ADD COLUMN `workingDaysPerWeek` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `workingHoursPerDay` DOUBLE NOT NULL DEFAULT 8.0;

-- Add computed columns with temporary defaults
ALTER TABLE `salary_structures`
    ADD COLUMN `monthlyWage` DOUBLE NOT NULL DEFAULT 50000,
    ADD COLUMN `standardAllowance` DOUBLE NOT NULL DEFAULT 4167,
    ADD COLUMN `performanceBonus` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `leaveTravelAllowance` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `fixedAllowance` DOUBLE NOT NULL DEFAULT 0;

-- Update existing rows: calculate wage from existing components
UPDATE `salary_structures` SET 
    `monthlyWage` = `basicSalary` + `hra` + `allowances`,
    `standardAllowance` = 4167,
    `performanceBonus` = ROUND(`basicSalary` * 0.0833, 2),
    `leaveTravelAllowance` = ROUND(`basicSalary` * 0.0833, 2),
    `fixedAllowance` = GREATEST(0, (`basicSalary` + `hra` + `allowances`) - (`basicSalary` + `hra` + 4167 + ROUND(`basicSalary` * 0.0833, 2) + ROUND(`basicSalary` * 0.0833, 2)));

-- Drop old columns
ALTER TABLE `salary_structures` 
    DROP COLUMN `allowances`,
    DROP COLUMN `deductions`,
    DROP COLUMN `pfContribution`;

-- Modify HRA to remove default
ALTER TABLE `salary_structures` ALTER COLUMN `hra` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `payruns_year_month_idx` ON `payruns`(`year`, `month`);

-- CreateIndex
CREATE INDEX `payslips_status_idx` ON `payslips`(`status`);

-- CreateIndex
CREATE INDEX `payslips_year_month_idx` ON `payslips`(`year`, `month`);
