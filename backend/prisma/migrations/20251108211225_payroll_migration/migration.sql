-- AlterTable
ALTER TABLE `payruns` ALTER COLUMN `payPeriodStart` DROP DEFAULT,
    ALTER COLUMN `payPeriodEnd` DROP DEFAULT;

-- AlterTable
ALTER TABLE `payslips` ALTER COLUMN `employeeCode` DROP DEFAULT,
    ALTER COLUMN `employeeName` DROP DEFAULT,
    ALTER COLUMN `totalDaysInMonth` DROP DEFAULT,
    ALTER COLUMN `workingDaysInMonth` DROP DEFAULT,
    ALTER COLUMN `standardAllowance` DROP DEFAULT,
    ALTER COLUMN `performanceBonus` DROP DEFAULT,
    ALTER COLUMN `leaveTravelAllowance` DROP DEFAULT,
    ALTER COLUMN `fixedAllowance` DROP DEFAULT,
    ALTER COLUMN `pfEmployee` DROP DEFAULT,
    ALTER COLUMN `pfEmployer` DROP DEFAULT,
    ALTER COLUMN `payPeriodStart` DROP DEFAULT,
    ALTER COLUMN `payPeriodEnd` DROP DEFAULT;

-- AlterTable
ALTER TABLE `salary_structures` ALTER COLUMN `monthlyWage` DROP DEFAULT,
    ALTER COLUMN `standardAllowance` DROP DEFAULT,
    ALTER COLUMN `performanceBonus` DROP DEFAULT,
    ALTER COLUMN `leaveTravelAllowance` DROP DEFAULT,
    ALTER COLUMN `fixedAllowance` DROP DEFAULT;
