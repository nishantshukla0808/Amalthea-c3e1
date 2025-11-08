"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const FIXTURES = {
    admin: '00000000-0000-4000-8000-000000000001',
    hrOfficer: '00000000-0000-4000-8000-000000000002',
    payrollOfficer: '00000000-0000-4000-8000-000000000003',
    employeeA: '00000000-0000-4000-8000-000000000010',
    employeeB: '00000000-0000-4000-8000-000000000011',
    employeeC: '00000000-0000-4000-8000-000000000012',
    empAdmin: '00000000-0000-4000-8000-000000000101',
    empHR: '00000000-0000-4000-8000-000000000102',
    empPayroll: '00000000-0000-4000-8000-000000000103',
    empA: '00000000-0000-4000-8000-000000000110',
    empB: '00000000-0000-4000-8000-000000000111',
    empC: '00000000-0000-4000-8000-000000000112',
    salaryA: '00000000-0000-4000-8000-000000000210',
    salaryB: '00000000-0000-4000-8000-000000000211',
    salaryC: '00000000-0000-4000-8000-000000000212',
    payrun202401: '00000000-0000-4000-8000-000000000301',
    payrun202402: '00000000-0000-4000-8000-000000000302',
};
async function main() {
    console.log('🌱 Starting seed...');
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
    const hashedPassword = await bcryptjs_1.default.hash('Password123!', 10);
    console.log('👤 Creating users...');
    await prisma.user.createMany({
        data: [
            {
                id: FIXTURES.admin,
                loginId: 'OIADUS20200001',
                email: 'admin@workzen.com',
                password: hashedPassword,
                role: client_1.Role.ADMIN,
                isActive: true,
                mustChangePassword: false,
            },
            {
                id: FIXTURES.hrOfficer,
                loginId: 'OIHERO20200002',
                email: 'hr@workzen.com',
                password: hashedPassword,
                role: client_1.Role.HR_OFFICER,
                isActive: true,
                mustChangePassword: false,
            },
            {
                id: FIXTURES.payrollOfficer,
                loginId: 'OIPEJO20210001',
                email: 'payroll@workzen.com',
                password: hashedPassword,
                role: client_1.Role.PAYROLL_OFFICER,
                isActive: true,
                mustChangePassword: false,
            },
            {
                id: FIXTURES.employeeA,
                loginId: 'OIALSM20210002',
                email: 'alice@workzen.com',
                password: hashedPassword,
                role: client_1.Role.EMPLOYEE,
                isActive: true,
                mustChangePassword: false,
            },
            {
                id: FIXTURES.employeeB,
                loginId: 'OIBOWI20220001',
                email: 'bob@workzen.com',
                password: hashedPassword,
                role: client_1.Role.EMPLOYEE,
                isActive: true,
                mustChangePassword: false,
            },
            {
                id: FIXTURES.employeeC,
                loginId: 'OICHBR20210003',
                email: 'charlie@workzen.com',
                password: hashedPassword,
                role: client_1.Role.EMPLOYEE,
                isActive: true,
                mustChangePassword: false,
            },
        ],
    });
    console.log('👥 Creating employee profiles...');
    await prisma.employee.createMany({
        data: [
            {
                id: FIXTURES.empAdmin,
                userId: FIXTURES.admin,
                employeeId: 'OIADUS20200001',
                firstName: 'Admin',
                lastName: 'User',
                dateOfBirth: new Date('1985-01-15'),
                dateOfJoining: new Date('2020-01-01'),
                joiningYear: 2020,
                department: 'Management',
                designation: 'System Administrator',
                phoneNumber: '+1234567890',
                address: '123 Admin Street, City',
                bankAccountNo: '1234567890',
                ifscCode: 'BANK0001234',
                panNumber: 'ABCDE1234F',
                aadharNumber: '123456789012',
            },
            {
                id: FIXTURES.empHR,
                userId: FIXTURES.hrOfficer,
                employeeId: 'OIHERO20200002',
                firstName: 'Helen',
                lastName: 'Rodriguez',
                dateOfBirth: new Date('1988-03-20'),
                dateOfJoining: new Date('2020-06-01'),
                joiningYear: 2020,
                department: 'Human Resources',
                designation: 'HR Officer',
                phoneNumber: '+1234567891',
                address: '456 HR Avenue, City',
                bankAccountNo: '2345678901',
                ifscCode: 'BANK0001235',
                panNumber: 'BCDEF2345G',
                aadharNumber: '234567890123',
            },
            {
                id: FIXTURES.empPayroll,
                userId: FIXTURES.payrollOfficer,
                employeeId: 'OIPEJO20210001',
                firstName: 'Peter',
                lastName: 'Johnson',
                dateOfBirth: new Date('1990-07-10'),
                dateOfJoining: new Date('2021-01-15'),
                joiningYear: 2021,
                department: 'Finance',
                designation: 'Payroll Officer',
                phoneNumber: '+1234567892',
                address: '789 Finance Road, City',
                bankAccountNo: '3456789012',
                ifscCode: 'BANK0001236',
                panNumber: 'CDEFG3456H',
                aadharNumber: '345678901234',
            },
            {
                id: FIXTURES.empA,
                userId: FIXTURES.employeeA,
                employeeId: 'OIALSM20210002',
                firstName: 'Alice',
                lastName: 'Smith',
                dateOfBirth: new Date('1992-05-12'),
                dateOfJoining: new Date('2021-03-01'),
                joiningYear: 2021,
                department: 'Engineering',
                designation: 'Senior Developer',
                phoneNumber: '+1234567893',
                address: '100 Developer Lane, City',
                bankAccountNo: '4567890123',
                ifscCode: 'BANK0001237',
                panNumber: 'DEFGH4567I',
                aadharNumber: '456789012345',
            },
            {
                id: FIXTURES.empB,
                userId: FIXTURES.employeeB,
                employeeId: 'OIBOWI20220001',
                firstName: 'Bob',
                lastName: 'Williams',
                dateOfBirth: new Date('1995-09-25'),
                dateOfJoining: new Date('2022-01-10'),
                joiningYear: 2022,
                department: 'Engineering',
                designation: 'Junior Developer',
                phoneNumber: '+1234567894',
                address: '200 Code Street, City',
                bankAccountNo: '5678901234',
                ifscCode: 'BANK0001238',
                panNumber: 'EFGHI5678J',
                aadharNumber: '567890123456',
            },
            {
                id: FIXTURES.empC,
                userId: FIXTURES.employeeC,
                employeeId: 'OICHBR20210003',
                firstName: 'Charlie',
                lastName: 'Brown',
                dateOfBirth: new Date('1993-11-08'),
                dateOfJoining: new Date('2021-08-20'),
                joiningYear: 2021,
                department: 'Marketing',
                designation: 'Marketing Manager',
                phoneNumber: '+1234567895',
                address: '300 Marketing Boulevard, City',
                bankAccountNo: '6789012345',
                ifscCode: 'BANK0001239',
                panNumber: 'FGHIJ6789K',
                aadharNumber: '678901234567',
            },
        ],
    });
    console.log('💰 Creating salary structures...');
    await prisma.salaryStructure.createMany({
        data: [
            {
                id: FIXTURES.salaryA,
                employeeId: FIXTURES.empA,
                basicSalary: 50000,
                hra: 20000,
                allowances: 10000,
                deductions: 0,
                pfContribution: 6000,
                effectiveFrom: new Date('2021-03-01'),
            },
            {
                id: FIXTURES.salaryB,
                employeeId: FIXTURES.empB,
                basicSalary: 30000,
                hra: 12000,
                allowances: 5000,
                deductions: 0,
                pfContribution: 3600,
                effectiveFrom: new Date('2022-01-10'),
            },
            {
                id: FIXTURES.salaryC,
                employeeId: FIXTURES.empC,
                basicSalary: 45000,
                hra: 18000,
                allowances: 8000,
                deductions: 0,
                pfContribution: 5400,
                effectiveFrom: new Date('2021-08-20'),
            },
        ],
    });
    console.log('📅 Creating attendance records...');
    const attendanceRecords = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6)
            continue;
        attendanceRecords.push({
            employeeId: FIXTURES.empA,
            date: new Date(currentDate),
            checkIn: new Date(currentDate.setHours(9, 0, 0)),
            checkOut: new Date(currentDate.setHours(18, 0, 0)),
            status: client_1.AttendanceStatus.PRESENT,
            workingHours: 9,
            isManual: false,
        });
        if (currentDate.getDate() !== 15 && currentDate.getDate() !== 16) {
            attendanceRecords.push({
                employeeId: FIXTURES.empB,
                date: new Date(currentDate),
                checkIn: new Date(currentDate.setHours(9, 30, 0)),
                checkOut: new Date(currentDate.setHours(18, 30, 0)),
                status: client_1.AttendanceStatus.PRESENT,
                workingHours: 9,
                isManual: false,
            });
        }
        attendanceRecords.push({
            employeeId: FIXTURES.empC,
            date: new Date(currentDate),
            checkIn: new Date(currentDate.setHours(9, 15, 0)),
            checkOut: currentDate.getDate() === 20
                ? new Date(currentDate.setHours(13, 0, 0))
                : new Date(currentDate.setHours(18, 15, 0)),
            status: currentDate.getDate() === 20 ? client_1.AttendanceStatus.HALF_DAY : client_1.AttendanceStatus.PRESENT,
            workingHours: currentDate.getDate() === 20 ? 4 : 9,
            isManual: false,
        });
    }
    await prisma.attendance.createMany({ data: attendanceRecords });
    console.log('🌴 Creating leave requests...');
    await prisma.leave.createMany({
        data: [
            {
                employeeId: FIXTURES.empA,
                leaveType: client_1.LeaveType.CASUAL,
                startDate: new Date('2024-02-05'),
                endDate: new Date('2024-02-06'),
                totalDays: 2,
                reason: 'Personal work',
                status: client_1.LeaveStatus.APPROVED,
                approvedBy: FIXTURES.hrOfficer,
                approvedAt: new Date('2024-01-30'),
            },
            {
                employeeId: FIXTURES.empB,
                leaveType: client_1.LeaveType.SICK,
                startDate: new Date('2024-01-15'),
                endDate: new Date('2024-01-16'),
                totalDays: 2,
                reason: 'Fever and cold',
                status: client_1.LeaveStatus.APPROVED,
                approvedBy: FIXTURES.hrOfficer,
                approvedAt: new Date('2024-01-14'),
            },
            {
                employeeId: FIXTURES.empC,
                leaveType: client_1.LeaveType.PAID,
                startDate: new Date('2024-02-10'),
                endDate: new Date('2024-02-10'),
                totalDays: 0.5,
                reason: 'Medical appointment',
                status: client_1.LeaveStatus.PENDING,
            },
        ],
    });
    console.log('📊 Creating payruns...');
    await prisma.payrun.createMany({
        data: [
            {
                id: FIXTURES.payrun202401,
                month: 1,
                year: 2024,
                status: client_1.PayrunStatus.DRAFT,
                totalGross: 0,
                totalNet: 0,
            },
            {
                id: FIXTURES.payrun202402,
                month: 2,
                year: 2024,
                status: client_1.PayrunStatus.DRAFT,
                totalGross: 0,
                totalNet: 0,
            },
        ],
    });
    console.log('⚙️ Creating settings...');
    await prisma.settings.createMany({
        data: [
            {
                key: 'company_name',
                value: 'WorkZen Technologies',
                description: 'Official company name',
            },
            {
                key: 'company_address',
                value: '123 Business Park, Tech City, 560001',
                description: 'Company registered address',
            },
            {
                key: 'pf_rate',
                value: '0.12',
                description: 'Provident Fund contribution rate (12%)',
            },
            {
                key: 'professional_tax_threshold',
                value: '15000',
                description: 'Minimum gross salary for professional tax',
            },
            {
                key: 'professional_tax_amount',
                value: '200',
                description: 'Professional tax amount (monthly)',
            },
            {
                key: 'working_days_per_month',
                value: '22',
                description: 'Standard working days per month',
            },
        ],
    });
    console.log('📝 Writing fixtures.json...');
    const fixturesPath = path_1.default.join(__dirname, '../fixtures.json');
    fs_1.default.writeFileSync(fixturesPath, JSON.stringify(FIXTURES, null, 2));
    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('─────────────────────────────────────');
    console.log('Admin:          admin@workzen.com / Password123!');
    console.log('HR Officer:     hr@workzen.com / Password123!');
    console.log('Payroll:        payroll@workzen.com / Password123!');
    console.log('Employee Alice: alice@workzen.com / Password123!');
    console.log('Employee Bob:   bob@workzen.com / Password123!');
    console.log('Employee Charlie: charlie@workzen.com / Password123!');
    console.log('─────────────────────────────────────');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map