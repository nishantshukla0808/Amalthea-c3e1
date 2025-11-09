// scripts/populate-data.ts
// Additive seed script - Adds more users and populates full year data
// Does NOT delete existing users

import { PrismaClient, Role, AttendanceStatus, LeaveType, LeaveStatus, PayrunStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEPARTMENTS = [
  'Engineering', 'Human Resources', 'Finance', 'Marketing', 
  'Sales', 'Operations', 'Customer Support', 'Product', 
  'Legal', 'IT', 'Administration'
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
  'IT': ['IT Support', 'System Administrator', 'Network Engineer', 'IT Manager'],
  'Administration': ['Administrator', 'Admin Manager', 'Office Manager']
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

function generateEmployeeId(role: Role, year: number, num: number): string {
  const prefix = role === Role.ADMIN ? 'OIADUS' :
                 role === Role.HR_OFFICER ? 'OIHERO' :
                 role === Role.PAYROLL_OFFICER ? 'OIPAJO' : 'OIALSM';
  return `${prefix}${year}${String(num).padStart(4, '0')}`;
}

async function main() {
  console.log('🌱 Starting data population (keeping existing users)...\n');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // ============================================
  // CHECK EXISTING DATA
  // ============================================
  const existingUsers = await prisma.user.findMany({
    include: { employee: true }
  });

  console.log(`📊 Found ${existingUsers.length} existing users`);
  
  const roleCount = {
    ADMIN: existingUsers.filter(u => u.role === Role.ADMIN).length,
    HR_OFFICER: existingUsers.filter(u => u.role === Role.HR_OFFICER).length,
    PAYROLL_OFFICER: existingUsers.filter(u => u.role === Role.PAYROLL_OFFICER).length,
    EMPLOYEE: existingUsers.filter(u => u.role === Role.EMPLOYEE).length,
  };

  console.log(`   - Admins: ${roleCount.ADMIN}`);
  console.log(`   - HR Officers: ${roleCount.HR_OFFICER}`);
  console.log(`   - Payroll Officers: ${roleCount.PAYROLL_OFFICER}`);
  console.log(`   - Employees: ${roleCount.EMPLOYEE}\n`);

  // ============================================
  // ADD NEW USERS TO REACH TARGET
  // ============================================
  const target = {
    ADMIN: 2,
    HR_OFFICER: 3,
    PAYROLL_OFFICER: 5,
    EMPLOYEE: 90
  };

  const toAdd = {
    ADMIN: Math.max(0, target.ADMIN - roleCount.ADMIN),
    HR_OFFICER: Math.max(0, target.HR_OFFICER - roleCount.HR_OFFICER),
    PAYROLL_OFFICER: Math.max(0, target.PAYROLL_OFFICER - roleCount.PAYROLL_OFFICER),
    EMPLOYEE: Math.max(0, target.EMPLOYEE - roleCount.EMPLOYEE),
  };

  console.log('➕ Will add:');
  console.log(`   - Admins: ${toAdd.ADMIN}`);
  console.log(`   - HR Officers: ${toAdd.HR_OFFICER}`);
  console.log(`   - Payroll Officers: ${toAdd.PAYROLL_OFFICER}`);
  console.log(`   - Employees: ${toAdd.EMPLOYEE}\n`);

  const allEmployees: any[] = existingUsers.map(u => u.employee).filter(e => e);
  let nameIndex = 0;

  // Add Admins
  for (let i = 0; i < toAdd.ADMIN; i++) {
    const firstName = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[nameIndex % LAST_NAMES.length];
    const employeeId = generateEmployeeId(Role.ADMIN, 2024, roleCount.ADMIN + i + 1);
    const joiningDate = randomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));

    const user = await prisma.user.create({
      data: {
        loginId: employeeId,
        email: `admin${roleCount.ADMIN + i + 1}@workzen.com`,
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
        mustChangePassword: false,
      },
    });

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

    allEmployees.push(employee);
    nameIndex++;
  }

  // Add HR Officers
  for (let i = 0; i < toAdd.HR_OFFICER; i++) {
    const firstName = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[nameIndex % LAST_NAMES.length];
    const employeeId = generateEmployeeId(Role.HR_OFFICER, 2024, roleCount.HR_OFFICER + i + 1);
    const joiningDate = randomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));

    const user = await prisma.user.create({
      data: {
        loginId: employeeId,
        email: `hr${roleCount.HR_OFFICER + i + 1}@workzen.com`,
        password: hashedPassword,
        role: Role.HR_OFFICER,
        isActive: true,
        mustChangePassword: false,
      },
    });

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

    allEmployees.push(employee);
    nameIndex++;
  }

  // Add Payroll Officers
  for (let i = 0; i < toAdd.PAYROLL_OFFICER; i++) {
    const firstName = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[nameIndex % LAST_NAMES.length];
    const employeeId = generateEmployeeId(Role.PAYROLL_OFFICER, 2024, roleCount.PAYROLL_OFFICER + i + 1);
    const joiningDate = randomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));

    const user = await prisma.user.create({
      data: {
        loginId: employeeId,
        email: `payroll${roleCount.PAYROLL_OFFICER + i + 1}@workzen.com`,
        password: hashedPassword,
        role: Role.PAYROLL_OFFICER,
        isActive: true,
        mustChangePassword: false,
      },
    });

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

    allEmployees.push(employee);
    nameIndex++;
  }

  // Add Regular Employees
  for (let i = 0; i < toAdd.EMPLOYEE; i++) {
    const firstName = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[nameIndex % LAST_NAMES.length];
    const department = getRandomElement(DEPARTMENTS);
    const employeeId = generateEmployeeId(Role.EMPLOYEE, 2024, roleCount.EMPLOYEE + i + 1);
    const joiningDate = randomDate(new Date(2020, 0, 1), new Date(2024, 10, 31));

    const user = await prisma.user.create({
      data: {
        loginId: employeeId,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${roleCount.EMPLOYEE + i + 1}@workzen.com`,
        password: hashedPassword,
        role: Role.EMPLOYEE,
        isActive: Math.random() > 0.05, // 95% active
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
        phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        address: `${Math.floor(Math.random() * 9999)} ${getRandomElement(['Elm', 'Maple', 'Cedar', 'Birch'])} St, City, State`,
        department,
        designation: getRandomElement(DESIGNATIONS[department as keyof typeof DESIGNATIONS]),
        dateOfJoining: joiningDate,
        joiningYear: joiningDate.getFullYear(),
        bankAccountNo: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        ifscCode: `BANK${Math.floor(1000000 + Math.random() * 9000000)}`,
      },
    });

    allEmployees.push(employee);
    nameIndex++;

    if ((i + 1) % 10 === 0) {
      console.log(`✅ Created ${i + 1}/${toAdd.EMPLOYEE} employees...`);
    }
  }

  const totalUsers = await prisma.user.count();
  console.log(`\n✅ Total users now: ${totalUsers}\n`);

  // ============================================
  // CREATE/UPDATE SALARY STRUCTURES
  // ============================================
  console.log('💰 Creating/updating salary structures...');
  
  let salaryCount = 0;
  for (const employee of allEmployees) {
    if (!employee) continue;
    
    // Check if salary structure exists
    const existing = await prisma.salaryStructure.findUnique({
      where: { employeeId: employee.id }
    });

    if (existing) continue; // Skip if already has salary

    const monthlyWage = Math.floor(40000 + Math.random() * 160000); // 40k to 200k
    const basicSalary = Math.floor(monthlyWage * 0.5);
    const hra = Math.floor(basicSalary * 0.5);
    const standardAllowance = 4167;
    const performanceBonus = Math.floor(basicSalary * 0.0833);
    const leaveTravelAllowance = Math.floor(basicSalary * 0.0833);
    const fixedAllowance = monthlyWage - basicSalary - hra - standardAllowance - performanceBonus - leaveTravelAllowance;

    await prisma.salaryStructure.create({
      data: {
        employeeId: employee.id,
        monthlyWage,
        basicSalary,
        hra,
        standardAllowance,
        performanceBonus,
        leaveTravelAllowance,
        fixedAllowance,
        effectiveFrom: employee.dateOfJoining,
      },
    });

    salaryCount++;
  }

  console.log(`✅ Created ${salaryCount} new salary structures\n`);

  // ============================================
  // POPULATE ATTENDANCE FOR 2024
  // ============================================
  console.log('📅 Populating attendance for 2024...');

  const year = 2024;
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  let attendanceCount = 0;
  
  for (const employee of allEmployees) {
    if (!employee) continue;
    
    const joiningDate = new Date(employee.dateOfJoining);
    const attendanceStartDate = joiningDate > startDate ? joiningDate : startDate;
    
    for (let d = new Date(attendanceStartDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Create a clean date for checking
      const dateOnly = new Date(currentDate);
      dateOnly.setHours(0, 0, 0, 0);
      
      // 90% attendance rate
      const isPresent = Math.random() > 0.1;
      
      if (isPresent) {
        try {
          const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
          const checkOutMinute = Math.floor(Math.random() * 60);
          
          const checkIn = new Date(currentDate);
          checkIn.setHours(checkInHour, checkInMinute, 0, 0);
          
          const checkOut = new Date(currentDate);
          checkOut.setHours(checkOutHour, checkOutMinute, 0, 0);
          
          const workingHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          
          await prisma.attendance.create({
            data: {
              employeeId: employee.id,
              date: new Date(dateOnly), // Use clean copy
              checkIn,
              checkOut,
              workingHours: Number(workingHours.toFixed(2)),
              status: workingHours >= 8 ? AttendanceStatus.PRESENT : AttendanceStatus.HALF_DAY,
            },
          });
          
          attendanceCount++;
        } catch (error: any) {
          // Skip if attendance already exists (P2002 is unique constraint violation)
          if (error.code !== 'P2002') {
            throw error;
          }
        }
      }
    }
  }

  console.log(`✅ Created ${attendanceCount} attendance records\n`);

  // ============================================
  // POPULATE LEAVES
  // ============================================
  console.log('🏖️ Creating leave records...');

  const leaveTypes = [LeaveType.SICK, LeaveType.CASUAL, LeaveType.PAID, LeaveType.MATERNITY, LeaveType.PATERNITY];
  let leaveCount = 0;

  for (const employee of allEmployees) {
    if (!employee) continue;
    
    const numberOfLeaves = 2 + Math.floor(Math.random() * 5); // 2-6 leaves
    
    for (let i = 0; i < numberOfLeaves; i++) {
      const leaveType = getRandomElement(leaveTypes);
      const startDate = randomDate(new Date(year, 0, 1), new Date(year, 11, 31));
      const duration = leaveType === LeaveType.MATERNITY ? 90 :
                       leaveType === LeaveType.PATERNITY ? 7 :
                       Math.floor(1 + Math.random() * 5);
      
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
          reason: `${leaveType} - Personal/Health reasons`,
          status,
        },
      });

      leaveCount++;
    }
  }

  console.log(`✅ Created ${leaveCount} leave records\n`);

  console.log('🎉 Data population completed!\n');
  console.log('📊 Summary:');
  console.log(`   👥 Total Users: ${totalUsers}`);
  console.log(`   💰 Salary Structures: ${salaryCount} created`);
  console.log(`   📅 Attendance Records: ${attendanceCount} created`);
  console.log(`   🏖️ Leave Records: ${leaveCount} created`);
  console.log('\n🔑 Default password for all users: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during population:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
