// check-employee-records.ts
// Check if users have corresponding employee records

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmployeeRecords() {
  console.log('🔍 Checking user-employee relationships...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        loginId: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { loginId: 'asc' },
    });

    console.log(`Found ${users.length} users:\n`);

    for (const user of users) {
      console.log(`📋 User: ${user.loginId} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);

      // Check for employee record
      const employee = await prisma.employee.findFirst({
        where: { userId: user.id },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          department: true,
          designation: true,
        },
      });

      if (employee) {
        console.log(`   ✅ Employee record found:`);
        console.log(`      ID: ${employee.employeeId}`);
        console.log(`      Name: ${employee.firstName} ${employee.lastName}`);
        console.log(`      Department: ${employee.department}`);
        console.log(`      Designation: ${employee.designation}`);
      } else {
        console.log(`   ❌ NO EMPLOYEE RECORD FOUND!`);
        console.log(`      This user cannot access attendance features.`);
      }
      console.log('');
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`Total users: ${users.length}`);
    const employeeCount = await prisma.employee.count();
    console.log(`Total employees: ${employeeCount}`);
    
    if (employeeCount < users.length) {
      console.log('\n⚠️  WARNING: Some users do not have employee records!');
      console.log('   These users will not be able to access attendance features.');
      console.log('   To fix this:');
      console.log('   1. Run the seed script: cd backend && npm run seed');
      console.log('   2. Or create employee records manually via the admin dashboard');
    } else {
      console.log('\n✅ All users have employee records!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployeeRecords();
