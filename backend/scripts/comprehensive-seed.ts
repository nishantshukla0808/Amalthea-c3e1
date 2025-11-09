// scripts/comprehensive-seed.ts
// Comprehensive seed script with 100+ users and full year data

import { PrismaClient, Role, AttendanceStatus, LeaveType, LeaveStatus, PayrunStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Departments and Designations
const DEPARTMENTS = [
  'Engineering', 'Human Resources', 'Finance', 'Marketing', 
  'Sales', 'Operations', 'Customer Support', 'Product', 
  'Legal', 'IT'
];

const DESIGNATIONS = {
  'Engineering': ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager'],
  'Human Resources': ['HR Executive', 'HR Manager', 'Recruiter', 'HR Director'],
  'Finance': ['Accountant', 'Financial Analyst', 'Finance Manager', 'CFO'],
  'Marketing': ['Marketing Executive', 'Marketing Manager', 'Content Writer', 'SEO Specialist'],
  'Sales': ['Sales Executive', 'Sales Manager', 'Business Development Manager', 'Account Manager'],
  'Operations': ['Operations Executive', 'Operations Manager', 'Logistics Coordinator'],
  'Customer Support': ['Support Executive', 'Support Manager', 'Support Team Lead'],
  'Product': ['Product Manager', 'Product Owner', 'UX Designer', 'Product Analyst'],
  'Legal': ['Legal Counsel', 'Legal Manager', 'Compliance Officer'],
  'IT': ['IT Support', 'System Administrator', 'Network Engineer', 'IT Manager']
};

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna',
  'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Frank', 'Christine', 'Gregory', 'Debra'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy'
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEmployeeId(role: Role, index: number): string {
  const prefix = role === Role.ADMIN ? 'OIADUS' :
                 role === Role.HR_OFFICER ? 'OIHERO' :
                 role === Role.PAYROLL_OFFICER ? 'OIPAJO' : 'OIALSM';
  const year = 2020 + Math.floor(index / 20);
  const num = String(index + 1).padStart(4, '0');
  return `${prefix}${year}${num}`;
}

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrun.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  console.log('👥 Creating users and employees...');
  
  const users: any[] = [];
  const employees: any[] = [];
  let userIndex = 0;

  // Create 2 Admins
  for (let i = 0; i < 2; i++) {
    const firstName = FIRST_NAMES[userIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[userIndex % LAST_NAMES.length];
    const employeeId = generateEmployeeId(Role.ADMIN, userIndex);
    
    const user = await prisma.user.create({
      data: {
        loginId: employeeId,
        email: `admin${i + 1}@workzen.com`,
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
        mustChangePassword: false,
      },
    });

    const joiningDate = randomDate(new Date(2020, 0, 1), new Date(2021, 11, 31));
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        userId: user.id,
        firstName,
        lastName,
        dateOfBirth: randomDate(new Date(1980, 0, 1), new Date(1995, 11, 31)),
        phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        address: `${Math.floor(Math.random() * 9999)} Main St, City, State`,
        department: 'Administration',
        designation: 'Administrator',
        dateOfJoining: joiningDate,
        joiningYear: joiningDate.getFullYear(),
        bankAccountNo: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        ifscCode: 'FNBK0001234',
      },
    });

    users.push(user);
    employees.push(employee);
    userIndex++;
  }

  // Create 3 HR Officers
  for (let i = 0; i < 3; i++) {
    const firstName = FIRST_NAMES[userIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[userIndex % LAST_NAMES.length];
    const employeeId = generateEmployeeId(Role.HR_OFFICER, userIndex);
    
    const user = await prisma.user.create({
      data: {
        loginId: employeeId,
        email: `hr${i + 1}@workzen.com`,
        password: hashedPassword,
        role: Role.HR_OFFICER,
        isActive: true,
        mustChangePassword: false,
      },
    });

    const joiningDate = randomDate(new Date(2020, 0, 1), new Date(2022, 11, 31));
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        userId: user.id,
        firstName,
        lastName,
        dateOfBirth: randomDate(new Date(1985, 0, 1), new Date(1995, 11, 31)),
        phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        address: `${Math.floor(Math.random() * 9999)} Oak Ave, City, State`,
        department: 'Human Resources',
        designation: getRandomElement(DESIGNATIONS['Human Resources']),
        dateOfJoining: joiningDate,
        joiningYear: joiningDate.getFullYear(),
        bankAccountNo: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        ifscCode: 'FNBK0001234',
      },
    });

    users.push(user);
    employees.push(employee);
    userIndex++;
  }

  // Create 5 Payroll Officers
  for (let i = 0; i < 5; i++) {
    const firstName = FIRST_NAMES[userIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[userIndex % LAST_NAMES.length];
    const employeeId = generateEmployeeId(Role.PAYROLL_OFFICER, userIndex);
    
    const user = await prisma.user.create({
      data: {
        loginId: employeeId,
        email: `payroll${i + 1}@workzen.com`,
        password: hashedPassword,
        role: Role.PAYROLL_OFFICER,
        isActive: true,
        mustChangePassword: false,
      },
    });

    const joiningDate = randomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        userId: user.id,
        firstName,
        lastName,
        dateOfBirth: randomDate(new Date(1985, 0, 1), new Date(1995, 11, 31)),
        phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        address: `${Math.floor(Math.random() * 9999)} Pine St, City, State`,
        department: 'Finance',
        designation: 'Payroll Officer',
        dateOfJoining: joiningDate,
        joiningYear: joiningDate.getFullYear(),
        bankAccountNo: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        ifscCode: 'FNBK0001234',
      },
    });

    users.push(user);
    employees.push(employee);
    userIndex++;
  }

  // Create 90 Regular Employees (to make total 100)
  for (let i = 0; i < 90; i++) {
    const firstName = FIRST_NAMES[userIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[userIndex % LAST_NAMES.length];
    const department = getRandomElement(DEPARTMENTS);
    const employeeId = generateEmployeeId(Role.EMPLOYEE, userIndex);
    
    const user = await prisma.user.create({
      data: {
        loginId: employeeId,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@workzen.com`,
        password: hashedPassword,
        role: Role.EMPLOYEE,
        isActive: Math.random() > 0.1, // 90% active
        mustChangePassword: false,
      },
    });

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        userId: user.id,
        firstName,
        lastName,
        dateOfBirth: randomDate(new Date(1985, 0, 1), new Date(2000, 11, 31)),
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        address: `${Math.floor(Math.random() * 9999)} ${getRandomElement(['Elm', 'Maple', 'Cedar', 'Birch'])} St, City, State`,
        department,
        designation: getRandomElement(DESIGNATIONS[department as keyof typeof DESIGNATIONS]),
        dateOfJoining: randomDate(new Date(2020, 0, 1), new Date(2024, 11, 31)),
        employmentType: Math.random() > 0.2 ? 'FULL_TIME' : 'PART_TIME',
        bankAccountNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        bankName: getRandomElement(['First National Bank', 'City Bank', 'Global Bank']),
        ifscCode: `BANK${Math.floor(1000000 + Math.random() * 9000000)}`,
      },
    });

    users.push(user);
    employees.push(employee);
    userIndex++;

    if ((i + 1) % 10 === 0) {
      console.log(`✅ Created ${userIndex} users and employees...`);
    }
  }

  console.log(`✅ Total created: ${users.length} users and ${employees.length} employees`);

  // ============================================
  // SALARY STRUCTURES
  // ============================================
  console.log('💰 Creating salary structures...');
  
  const salaryStructures: any[] = [];
  
  for (const employee of employees) {
    const baseSalary = Math.floor(30000 + Math.random() * 120000); // 30k to 150k
    const hra = Math.floor(baseSalary * 0.4);
    const da = Math.floor(baseSalary * 0.1);
    const bonus = Math.floor(baseSalary * 0.15);
    const pf = Math.floor(baseSalary * 0.12);
    const tax = Math.floor((baseSalary + hra + da) * 0.1);

    const salary = await prisma.salaryStructure.create({
      data: {
        employeeId: employee.id,
        baseSalary,
        hra,
        da,
        bonus,
        otherAllowances: Math.floor(Math.random() * 5000),
        pf,
        tax,
        otherDeductions: Math.floor(Math.random() * 2000),
        effectiveFrom: employee.dateOfJoining,
      },
    });

    salaryStructures.push(salary);
  }

  console.log(`✅ Created ${salaryStructures.length} salary structures`);

  // ============================================
  // ATTENDANCE - Full Year 2024
  // ============================================
  console.log('📅 Creating attendance records for 2024...');

  const year = 2024;
  const startDate = new Date(year, 0, 1); // Jan 1, 2024
  const endDate = new Date(year, 11, 31); // Dec 31, 2024
  
  let attendanceCount = 0;
  
  for (const employee of employees) {
    const joiningDate = new Date(employee.dateOfJoining);
    const attendanceStartDate = joiningDate > startDate ? joiningDate : startDate;
    
    // Create attendance for each day
    for (let d = new Date(attendanceStartDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // 85% attendance rate
      const isPresent = Math.random() > 0.15;
      
      if (isPresent) {
        const checkInHour = 8 + Math.floor(Math.random() * 3); // 8-10 AM
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkOutHour = 17 + Math.floor(Math.random() * 3); // 5-7 PM
        const checkOutMinute = Math.floor(Math.random() * 60);
        
        const checkIn = new Date(currentDate);
        checkIn.setHours(checkInHour, checkInMinute, 0, 0);
        
        const checkOut = new Date(currentDate);
        checkOut.setHours(checkOutHour, checkOutMinute, 0, 0);
        
        const workingHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        
        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date: new Date(currentDate.setHours(0, 0, 0, 0)),
            checkIn,
            checkOut,
            workingHours: Number(workingHours.toFixed(2)),
            status: workingHours >= 8 ? AttendanceStatus.PRESENT : AttendanceStatus.HALF_DAY,
          },
        });
        
        attendanceCount++;
      }
    }
  }

  console.log(`✅ Created ${attendanceCount} attendance records`);

  // ============================================
  // LEAVES - Throughout 2024
  // ============================================
  console.log('🏖️ Creating leave records...');

  const leaveTypes = [
    LeaveType.CASUAL_LEAVE,
    LeaveType.SICK_LEAVE,
    LeaveType.ANNUAL_LEAVE,
    LeaveType.MATERNITY_LEAVE,
    LeaveType.PATERNITY_LEAVE,
  ];

  let leaveCount = 0;

  for (const employee of employees) {
    // Each employee gets 3-8 leaves per year
    const numberOfLeaves = 3 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < numberOfLeaves; i++) {
      const leaveType = getRandomElement(leaveTypes);
      const startDate = randomDate(new Date(year, 0, 1), new Date(year, 11, 31));
      const duration = leaveType === LeaveType.MATERNITY_LEAVE ? 90 :
                       leaveType === LeaveType.PATERNITY_LEAVE ? 7 :
                       Math.floor(1 + Math.random() * 5); // 1-5 days
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration - 1);
      
      const status = Math.random() > 0.2 ? LeaveStatus.APPROVED :
                     Math.random() > 0.5 ? LeaveStatus.PENDING : LeaveStatus.REJECTED;

      await prisma.leave.create({
        data: {
          employeeId: employee.id,
          leaveType,
          startDate,
          endDate,
          totalDays: duration,
          reason: `${leaveType.replace('_', ' ')} - Personal/Health reasons`,
          status,
          appliedDate: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // Applied 7 days before
        },
      });

      leaveCount++;
    }
  }

  console.log(`✅ Created ${leaveCount} leave records`);

  // ============================================
  // PAYRUNS & PAYSLIPS - All 12 months of 2024
  // ============================================
  console.log('💵 Creating payruns and payslips...');

  let payrunCount = 0;
  let payslipCount = 0;

  for (let month = 1; month <= 12; month++) {
    const payPeriodStart = new Date(year, month - 1, 1);
    const payPeriodEnd = new Date(year, month, 0); // Last day of month
    const paymentDate = new Date(year, month, 5); // 5th of next month

    const payrun = await prisma.payrun.create({
      data: {
        month,
        year,
        payPeriodStart,
        payPeriodEnd,
        paymentDate,
        status: month < 11 ? PayrunStatus.COMPLETED : PayrunStatus.PENDING,
        totalAmount: 0, // Will be updated
      },
    });

    payrunCount++;

    let totalPayrunAmount = 0;

    // Create payslips for all employees
    for (const employee of employees) {
      const salary = salaryStructures.find(s => s.employeeId === employee.id);
      if (!salary) continue;

      const joiningDate = new Date(employee.dateOfJoining);
      if (joiningDate > payPeriodEnd) continue; // Skip if not joined yet

      const grossSalary = salary.baseSalary + salary.hra + salary.da + salary.bonus + salary.otherAllowances;
      const totalDeductions = salary.pf + salary.tax + salary.otherDeductions;
      const netSalary = grossSalary - totalDeductions;

      await prisma.payslip.create({
        data: {
          payrunId: payrun.id,
          employeeId: employee.id,
          month,
          year,
          baseSalary: salary.baseSalary,
          hra: salary.hra,
          da: salary.da,
          bonus: salary.bonus,
          otherAllowances: salary.otherAllowances,
          grossSalary,
          pf: salary.pf,
          tax: salary.tax,
          otherDeductions: salary.otherDeductions,
          totalDeductions,
          netSalary,
          paymentDate,
          paymentStatus: month < 11 ? 'PAID' : 'PENDING',
        },
      });

      totalPayrunAmount += netSalary;
      payslipCount++;
    }

    // Update payrun total amount
    await prisma.payrun.update({
      where: { id: payrun.id },
      data: { totalAmount: totalPayrunAmount },
    });
  }

  console.log(`✅ Created ${payrunCount} payruns and ${payslipCount} payslips`);

  // ============================================
  // SETTINGS
  // ============================================
  console.log('⚙️ Creating settings...');

  await prisma.settings.create({
    data: {
      companyName: 'WorkZen Inc.',
      companyAddress: '123 Business Park, Tech City, TC 12345',
      companyEmail: 'contact@workzen.com',
      companyPhone: '+1-555-0123',
      fiscalYearStart: new Date(year, 3, 1), // April 1
      workingDaysPerWeek: 5,
      leaveQuotas: {
        CASUAL_LEAVE: 12,
        SICK_LEAVE: 12,
        ANNUAL_LEAVE: 15,
        MATERNITY_LEAVE: 90,
        PATERNITY_LEAVE: 7,
      },
    },
  });

  console.log('✅ Settings created');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👥 Users: ${users.length}`);
  console.log(`      - Admins: 2`);
  console.log(`      - HR Officers: 3`);
  console.log(`      - Payroll Officers: 5`);
  console.log(`      - Employees: 90`);
  console.log(`   💰 Salary Structures: ${salaryStructures.length}`);
  console.log(`   📅 Attendance Records: ${attendanceCount}`);
  console.log(`   🏖️ Leave Records: ${leaveCount}`);
  console.log(`   💵 Payruns: ${payrunCount}`);
  console.log(`   📄 Payslips: ${payslipCount}`);
  console.log('\n🔑 Default password for all users: Password123!');
  console.log('\n👤 Sample Login Credentials:');
  console.log('   Admin: admin1@workzen.com');
  console.log('   HR: hr1@workzen.com');
  console.log('   Payroll: payroll1@workzen.com');
  console.log('   Employee: Use any employee email from the database');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
