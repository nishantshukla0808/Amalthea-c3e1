import prisma from '../config/database';

/**
 * Generate Login ID in format: OI[FirstName][LastName][Year][Serial]
 * Example: OIJODO20220001
 * 
 * @param firstName - Employee's first name
 * @param lastName - Employee's last name
 * @param joiningYear - Year of joining
 * @returns Generated login ID
 */
export async function generateLoginId(
  firstName: string,
  lastName: string,
  joiningYear: number
): Promise<string> {
  // Extract first two letters of first name and last name
  const firstNamePrefix = firstName.substring(0, 2).toUpperCase();
  const lastNamePrefix = lastName.substring(0, 2).toUpperCase();

  // Count existing employees for this year to get serial number
  const existingCount = await prisma.employee.count({
    where: {
      joiningYear: joiningYear,
    },
  });

  // Serial number is count + 1, padded to 4 digits
  const serialNumber = (existingCount + 1).toString().padStart(4, '0');

  // Format: OIJODO20220001
  const loginId = `OI${firstNamePrefix}${lastNamePrefix}${joiningYear}${serialNumber}`;

  // Verify uniqueness (in case of conflicts)
  const existing = await prisma.user.findUnique({
    where: { loginId },
  });

  if (existing) {
    // If conflict, increment serial number
    const nextSerial = (existingCount + 2).toString().padStart(4, '0');
    return `OI${firstNamePrefix}${lastNamePrefix}${joiningYear}${nextSerial}`;
  }

  return loginId;
}

/**
 * Validate if a login ID follows the correct format
 */
export function validateLoginIdFormat(loginId: string): boolean {
  // Format: OI + 2 letters + 2 letters + 4 digits + 4 digits
  // Example: OIJODO20220001
  const regex = /^OI[A-Z]{2}[A-Z]{2}\d{4}\d{4}$/;
  return regex.test(loginId);
}

/**
 * Parse login ID to extract components
 */
export function parseLoginId(loginId: string): {
  companyCode: string;
  firstNamePrefix: string;
  lastNamePrefix: string;
  joiningYear: number;
  serialNumber: string;
} | null {
  if (!validateLoginIdFormat(loginId)) {
    return null;
  }

  return {
    companyCode: loginId.substring(0, 2), // OI
    firstNamePrefix: loginId.substring(2, 4),
    lastNamePrefix: loginId.substring(4, 6),
    joiningYear: parseInt(loginId.substring(6, 10)),
    serialNumber: loginId.substring(10, 14),
  };
}
