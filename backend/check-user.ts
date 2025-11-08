import { PrismaClient } from '@prisma/client';
import { comparePassword } from './src/utils/password';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    // Find the admin user
    const user = await prisma.user.findFirst({
      where: {
        loginId: 'OIADUS20200001'
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log('Login ID:', user.loginId);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Is Active:', user.isActive);
    console.log('Password Hash:', user.password.substring(0, 20) + '...');

    // Test password
    const testPassword = 'NewPassword123!';
    const isValid = await comparePassword(testPassword, user.password);
    console.log('\n🔐 Password Test:');
    console.log('Testing password:', testPassword);
    console.log('Result:', isValid ? '✅ VALID' : '❌ INVALID');

    // Also test old password
    const oldPassword = 'Admin@123';
    const isOldValid = await comparePassword(oldPassword, user.password);
    console.log('\nTesting old password:', oldPassword);
    console.log('Result:', isOldValid ? '✅ VALID' : '❌ INVALID');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
