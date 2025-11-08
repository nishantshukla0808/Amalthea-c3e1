import crypto from 'crypto';

/**
 * Generate a secure random password that meets all strength requirements
 * 
 * Password requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param length - Password length (default: 12)
 * @returns Generated secure password
 */
export function generateSecurePassword(length: number = 12): string {
  if (length < 12) {
    throw new Error('Password length must be at least 12 characters');
  }

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Ensure at least one character from each category
  let password = '';
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += specialChars[crypto.randomInt(0, specialChars.length)];

  // Fill remaining characters randomly from all categories
  const allChars = uppercase + lowercase + numbers + specialChars;
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Shuffle the password to randomize character positions
  password = shuffleString(password);

  return password;
}

/**
 * Shuffle a string using Fisher-Yates algorithm
 */
function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Generate a temporary password for display purposes
 * This generates a more memorable password using words and numbers
 * 
 * @returns Generated temporary password
 */
export function generateTemporaryPassword(): string {
  const adjectives = ['Quick', 'Brave', 'Smart', 'Swift', 'Bold', 'Wise', 'Clear'];
  const nouns = ['Tiger', 'Eagle', 'Lion', 'Wolf', 'Bear', 'Hawk', 'Fox'];
  const specialChars = ['!', '@', '#', '$', '%', '&', '*'];

  const adjective = adjectives[crypto.randomInt(0, adjectives.length)];
  const noun = nouns[crypto.randomInt(0, nouns.length)];
  const number = crypto.randomInt(100, 999);
  const special = specialChars[crypto.randomInt(0, specialChars.length)];

  // Format: QuickTiger123!
  return `${adjective}${noun}${number}${special}`;
}
