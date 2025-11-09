// Quick test script to check salary structures
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSalaryStructures() {
  try {
    const count = await prisma.salaryStructure.count();
    console.log(`\n✅ Total Salary Structures: ${count}\n`);
    
    if (count > 0) {
      const structures = await prisma.salaryStructure.findMany({
        include: {
          employee: {
            select: {
              employeeId: true,
              firstName: true,
              lastName: true,
              department: true,
            },
          },
        },
        take: 5,
      });
      
      console.log('📋 Sample Salary Structures:\n');
      structures.forEach((s, i) => {
        console.log(`${i + 1}. ${s.employee.firstName} ${s.employee.lastName} (${s.employee.employeeId})`);
        console.log(`   Monthly Wage: ₹${s.basicSalary + s.hra + s.allowances}`);
        console.log(`   Department: ${s.employee.department}`);
        console.log(`   Effective From: ${s.effectiveFrom.toISOString().split('T')[0]}\n`);
      });
    } else {
      console.log('❌ No salary structures found in database.');
      console.log('💡 Create one at: http://localhost:3000/dashboard/payroll/salary-structure/create\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSalaryStructures();
