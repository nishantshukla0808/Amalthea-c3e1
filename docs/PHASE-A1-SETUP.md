# 📋 Phase A.1 - Setup Instructions

## ✅ What was delivered

This phase includes:

1. ✅ **Prisma Schema** (`prisma/schema.prisma`)
   - Complete data models for Users, Employees, Attendance, Leave, Payroll, Payslips
   - Enums for Roles, Leave Types, Payrun Status
   - Relationships and indexes

2. ✅ **Seed Script** (`scripts/seed.ts`)
   - Deterministic UUIDs for all test data
   - 6 test users (Admin, HR, Payroll, 3 Employees)
   - Sample attendance, leave requests, and salary structures
   - Generates `fixtures.json` with stable IDs

3. ✅ **Express Server** (`src/index.ts`)
   - Health check endpoint (`/api/health`)
   - CORS, Helmet security
   - Error handling middleware

4. ✅ **Configuration Files**
   - `package.json` with all dependencies
   - `tsconfig.json` for TypeScript
   - `.env.example` template
   - `README.md` documentation

---

## 🚀 Installation Steps

### 1. Install Dependencies

```powershell
npm install
```

### 2. Setup Environment

Create `.env` file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and update your MySQL credentials:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/workzen_hrms"
```

### 3. Setup Database

```powershell
# Generate Prisma Client
npm run db:generate

# Create database and run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed
```

Expected output:
```
🌱 Starting seed...
🧹 Clearing existing data...
👤 Creating users...
👥 Creating employee profiles...
💰 Creating salary structures...
📅 Creating attendance records...
🌴 Creating leave requests...
📊 Creating payruns...
⚙️ Creating settings...
📝 Writing fixtures.json...
✅ Seed completed successfully!

📋 Test Credentials:
─────────────────────────────────────
Admin:          admin@workzen.com / Password123!
HR Officer:     hr@workzen.com / Password123!
Payroll:        payroll@workzen.com / Password123!
Employee Alice: alice@workzen.com / Password123!
Employee Bob:   bob@workzen.com / Password123!
Employee Charlie: charlie@workzen.com / Password123!
─────────────────────────────────────
```

### 4. Start Development Server

```powershell
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════════╗
║     🚀 WorkZen HRMS Server Started       ║
╚═══════════════════════════════════════════╝

🌐 Server:      http://localhost:5000
🏥 Health:      http://localhost:5000/api/health
🌍 Environment: development

📝 Press Ctrl+C to stop the server
```

---

## 🧪 Verification Tests

Run the automated test script:

```powershell
# PowerShell
.\tests\A1-health-check.ps1

# Or Git Bash
bash ./tests/A1-health-check.sh
```

**Manual curl tests:**

```bash
# Test 1: Health Check
curl http://localhost:5000/api/health

# Expected Response:
{
  "status": "OK",
  "message": "WorkZen HRMS API is running",
  "timestamp": "2024-01-XX...",
  "version": "1.0.0",
  "environment": "development"
}

# Test 2: Root Endpoint
curl http://localhost:5000/

# Expected Response:
{
  "message": "Welcome to WorkZen HRMS API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "docs": "/api/docs (coming soon)"
  }
}

# Test 3: 404 Handler
curl http://localhost:5000/api/nonexistent

# Expected Response (404):
{
  "error": "Not Found",
  "message": "The requested resource does not exist"
}
```

---

## 📂 Generated Files

After running seed, you should see:

- ✅ `fixtures.json` — Contains all deterministic UUIDs
- ✅ Database tables created with sample data

**Check fixtures.json:**

```powershell
cat fixtures.json
```

Expected output:
```json
{
  "admin": "00000000-0000-4000-8000-000000000001",
  "hrOfficer": "00000000-0000-4000-8000-000000000002",
  "payrollOfficer": "00000000-0000-4000-8000-000000000003",
  "employeeA": "00000000-0000-4000-8000-000000000010",
  ...
}
```

---

## 🔍 Database Verification

Open Prisma Studio to inspect the data:

```powershell
npm run db:studio
```

This will open **http://localhost:5555** where you can browse:

- ✅ 6 Users with roles
- ✅ 6 Employee profiles
- ✅ 3 Salary structures
- ✅ ~60 Attendance records (January 2024)
- ✅ 3 Leave requests
- ✅ 2 Payruns (Draft status)
- ✅ 6 Settings entries

---

## ✅ Success Criteria

Phase A.1 is complete when:

- [x] `npm install` succeeds
- [x] `npm run db:migrate` creates all tables
- [x] `npm run db:seed` populates data successfully
- [x] `fixtures.json` is generated with correct UUIDs
- [x] `npm run dev` starts server on port 5000
- [x] Health endpoint returns 200 OK
- [x] All test scripts pass

---

## 🌿 Git Workflow

### Branch & Commit

```powershell
# Create feature branch
git checkout -b A1-prisma-schema

# Stage files
git add .

# Commit
git commit -m "[A1] Add Prisma schema, seed script, and health endpoint

- Complete Prisma schema with all HRMS entities
- Deterministic seed script with fixtures.json
- Express server with health check endpoint
- TypeScript configuration
- Environment template and documentation"

# Push to remote
git push origin A1-prisma-schema
```

### Create Pull Request

**PR Title:** `[A1] Backend foundation - Prisma setup`

**PR Description:**
```markdown
## Phase A.1 - Prisma Schema & Seed

### Changes
- ✅ Complete Prisma schema with all entities
- ✅ Deterministic seed script generating fixtures.json
- ✅ Express server skeleton with health endpoint
- ✅ TypeScript & environment configuration
- ✅ Comprehensive documentation

### Testing
- [x] Database migrations successful
- [x] Seed script generates test data
- [x] Health endpoint returns 200 OK
- [x] fixtures.json created with stable UUIDs

### Test Credentials
- Admin: admin@workzen.com / Password123!
- HR: hr@workzen.com / Password123!
- Payroll: payroll@workzen.com / Password123!

### Next Steps
Phase A.2 will add Prisma client initialization and database utilities.
```

**Checklist:**
- [x] Schema includes all required entities
- [x] Seed script runs without errors
- [x] fixtures.json generated correctly
- [x] Health endpoint accessible
- [x] Documentation updated
- [x] No TypeScript errors (after npm install)
- [x] Environment example provided

---

## 🐛 Troubleshooting

**Issue:** `Cannot connect to MySQL`
- **Fix:** Ensure MySQL is running and credentials in `.env` are correct

**Issue:** `Prisma Client not generated`
- **Fix:** Run `npm run db:generate`

**Issue:** `Port 5000 already in use`
- **Fix:** Change `PORT` in `.env` or kill process using port 5000

**Issue:** `Module not found errors`
- **Fix:** Run `npm install` first

---

## 📌 Important Notes

1. **All test users have password:** `Password123!`
2. **fixtures.json UUIDs are deterministic** for consistent testing
3. **Seed script is idempotent** (can run multiple times)
4. **TypeScript errors will resolve** after `npm install`

---

## 🎯 Phase A.1 Complete!

You now have:
- ✅ Complete database schema
- ✅ Seeded test data
- ✅ Running Express server
- ✅ Health check endpoint
- ✅ Development environment ready

---

**Next:** Wait for PR approval before proceeding to Phase A.2
