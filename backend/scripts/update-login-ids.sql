-- Update joiningYear for all employees
UPDATE `employees` 
SET joiningYear = YEAR(dateOfJoining)
WHERE joiningYear IS NULL;

-- Generate employeeId for each employee (one by one to avoid conflicts)
-- First, create a temp table with the sequential numbers
CREATE TEMPORARY TABLE IF NOT EXISTS temp_seq AS
SELECT 
    e.id,
    CONCAT('OI', 
        UPPER(SUBSTRING(e.firstName, 1, 2)),
        UPPER(SUBSTRING(e.lastName, 1, 2)),
        YEAR(e.dateOfJoining),
        LPAD((SELECT COUNT(*) FROM employees e2 
              WHERE YEAR(e2.dateOfJoining) = YEAR(e.dateOfJoining) 
              AND e2.id <= e.id), 4, '0')
    ) as genId
FROM employees e
WHERE e.employeeId IS NULL;

-- Update employees with generated IDs
UPDATE employees e
INNER JOIN temp_seq t ON e.id = t.id
SET e.employeeId = t.genId;

-- Drop temp table
DROP TEMPORARY TABLE IF EXISTS temp_seq;

-- Update users with loginId from employees
UPDATE users u
INNER JOIN employees e ON e.userId = u.id
SET u.loginId = e.employeeId
WHERE u.loginId IS NULL;

-- For any remaining users without employees, give them a temp ID
UPDATE users 
SET loginId = CONCAT('TEMP', SUBSTRING(MD5(id), 1, 12))
WHERE loginId IS NULL;

-- Make columns NOT NULL
ALTER TABLE `employees` 
    MODIFY COLUMN `employeeId` VARCHAR(191) NOT NULL,
    MODIFY COLUMN `joiningYear` INTEGER NOT NULL;

ALTER TABLE `users` 
    MODIFY COLUMN `loginId` VARCHAR(191) NOT NULL,
    MODIFY COLUMN `mustChangePassword` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS `employees_employeeId_key` ON `employees`(`employeeId`);
CREATE INDEX IF NOT EXISTS `employees_employeeId_idx` ON `employees`(`employeeId`);
CREATE INDEX IF NOT EXISTS `employees_joiningYear_idx` ON `employees`(`joiningYear`);
CREATE UNIQUE INDEX IF NOT EXISTS `users_loginId_key` ON `users`(`loginId`);
CREATE INDEX IF NOT EXISTS `users_loginId_idx` ON `users`(`loginId`);
