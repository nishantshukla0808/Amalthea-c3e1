# 🚀 WorkZen HRMS

**WorkZen** is a production-grade Human Resource Management System (HRMS) built with modern technologies.

## 📋 Features

- ✅ **Authentication & RBAC** (Admin, HR Officer, Payroll Officer, Employee)
- ✅ **User Management** with role-based access control
- ✅ **Attendance Tracking** (check-in/out, manual overrides)
- ✅ **Leave Management** (apply, approve, reject, cancel)
- ✅ **Payroll Processing** (deterministic calculations)
- ✅ **Payslip Generation** (PDF + email delivery)
- ✅ **Analytics Dashboard** (role-aware insights)
- ✅ **Audit Logging** (complete change tracking)

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **PDF Generation:** Puppeteer
- **Email:** Nodemailer

### Frontend (Coming Soon)
- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **Auth:** NextAuth.js

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- MySQL 8+ running
- Git

### 2. Clone & Install

```bash
git clone <repository-url>
cd Amalthea-c3e1
npm install
```

### 3. Environment Setup

Create `.env` file:

```bash
cp .env.example .env
```

Update `.env` with your MySQL credentials:

```env
DATABASE_URL="mysql://root:password@localhost:3306/workzen_hrms"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start at: **http://localhost:5000**

---

## 🧪 Test Credentials

After running `npm run db:seed`, use these credentials:

| Role             | Email                  | Password      |
|------------------|------------------------|---------------|
| Admin            | admin@workzen.com      | Password123!  |
| HR Officer       | hr@workzen.com         | Password123!  |
| Payroll Officer  | payroll@workzen.com    | Password123!  |
| Employee (Alice) | alice@workzen.com      | Password123!  |
| Employee (Bob)   | bob@workzen.com        | Password123!  |
| Employee (Charlie) | charlie@workzen.com  | Password123!  |

---

## 📡 API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

**More endpoints coming in Phase A.2+**

---

## 🗂 Project Structure

```
Amalthea-c3e1/
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/
│   └── seed.ts             # Database seeding
├── src/
│   └── index.ts            # Main server entry
├── fixtures.json           # Test data IDs
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📝 Development Phases

- ✅ **Phase A.1** — Prisma Schema & Seed (CURRENT)
- ⏳ **Phase A.2** — Prisma Client Setup
- ⏳ **Phase A.3** — Auth Routes & JWT
- ⏳ **Phase A.4** — RBAC Middleware
- ⏳ **Phase A.5** — Health & Logging
- ⏳ **Phase B** — Core APIs (Users, Attendance, Leave, Payroll)
- ⏳ **Phase C** — Testing & CI
- ⏳ **Phase D** — Frontend Integration

---

## 🤝 Contributing

This project follows a **strict commit protocol**. Each phase must be:

1. Developed in a feature branch
2. Tested with curl scripts
3. Reviewed via PR
4. Merged to main

---

## 📄 License

MIT License

---

## 📞 Support

For issues or questions, open a GitHub issue.

---

**Built with ❤️ by the WorkZen Team**
