# WorkZen HRMS - Login ID System Documentation

## Overview

The Login ID system is an enterprise-grade employee identification system that automatically generates unique login IDs for all employees. This system replaces public registration with an admin/HR-controlled user creation process.

## Login ID Format

```
OI[FirstName2][LastName2][Year][Serial4]
```

### Components:
- **OI**: Company prefix (Odoo India)
- **FirstName2**: First 2 letters of first name (uppercase)
- **LastName2**: First 2 letters of last name (uppercase)
- **Year**: 4-digit year of joining
- **Serial4**: 4-digit serial number (incremental per year, padded with zeros)

### Examples:
- John Doe joining in 2022 (first employee): `OIJODO20220001`
- Jane Smith joining in 2022 (second employee): `OJASM20220002`
- John Doe joining in 2023 (first employee): `OIJODO20230001`

## Key Features

### 1. Admin/HR-Only User Creation
- Public registration is **disabled**
- Only users with `ADMIN` or `HR_OFFICER` roles can create new users
- Endpoint: `POST /api/users`

### 2. Auto-Generated Credentials
- **Login ID**: Generated automatically based on name and joining year
- **Temporary Password**: Cryptographically secure random password
- **Password Policy**: Enforced on password change

### 3. First-Time Password Change
- New users must change their password on first login
- `mustChangePassword` flag set to `true` for new users
- Endpoint: `POST /api/auth/change-password`

### 4. Dual Login Support
- Users can login with **email OR loginId**
- Same password for both methods
- Endpoint: `POST /api/auth/login`

## Database Schema

### User Model
```prisma
model User {
  id                    String   @id @default(uuid())
  loginId               String   @unique              // Auto-generated: OIJODO20220001
  email                 String   @unique
  password              String                        // bcrypt hashed
  role                  Role     @default(EMPLOYEE)
  isActive              Boolean  @default(true)
  mustChangePassword    Boolean  @default(true)       // Force password change
  lastPasswordChange    DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  employee  Employee?
  @@index([loginId])
}
```

### Employee Model
```prisma
model Employee {
  id              String    @id @default(uuid())
  userId          String    @unique
  employeeId      String    @unique              // Same as User.loginId
  joiningYear     Int                            // Year from dateOfJoining
  // ... other fields
  
  @@index([employeeId])
  @@index([joiningYear])
}
```

## API Endpoints

### 1. Create User (Admin/HR Only)

**POST** `/api/users`

**Authentication:** Required (JWT)  
**Authorization:** ADMIN, HR_OFFICER

**Request Body:**
```json
{
  "email": "john.doe@workzen.com",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfJoining": "2022-01-15",
  "dateOfBirth": "1990-05-20",
  "department": "Engineering",
  "designation": "Software Engineer",
  "phoneNumber": "+91-9876543210",
  "address": "123 Main St, Mumbai",
  "emergencyContact": "+91-9876543211",
  "bankAccountNo": "123456789012",
  "ifscCode": "HDFC0001234",
  "panNumber": "ABCDE1234F",
  "aadharNumber": "123456789012",
  "role": "EMPLOYEE"
}
```

**Required Fields:**
- `email`
- `firstName`
- `lastName`
- `dateOfJoining`

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "loginId": "OIJODO20220001",
    "email": "john.doe@workzen.com",
    "temporaryPassword": "QuickTiger123!",
    "role": "EMPLOYEE",
    "mustChangePassword": true,
    "employee": {
      "employeeId": "OIJODO20220001",
      "firstName": "John",
      "lastName": "Doe",
      "department": "Engineering",
      "designation": "Software Engineer"
    }
  }
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "john.doe@workzen.com",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfJoining": "2022-01-15",
    "department": "Engineering",
    "designation": "Software Engineer"
  }'
```

### 2. Login (Email or LoginId)

**POST** `/api/auth/login`

**Request Body (Email):**
```json
{
  "email": "john.doe@workzen.com",
  "password": "QuickTiger123!"
}
```

**Request Body (LoginId):**
```json
{
  "loginId": "OIJODO20220001",
  "password": "QuickTiger123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "loginId": "OIJODO20220001",
    "email": "john.doe@workzen.com",
    "role": "EMPLOYEE",
    "isActive": true,
    "createdAt": "2022-01-15T10:00:00.000Z"
  },
  "mustChangePassword": true
}
```

**Example cURL:**
```bash
# Login with email
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@workzen.com",
    "password": "Password123!"
  }'

# Login with loginId
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "OIJODO20220001",
    "password": "QuickTiger123!"
  }'
```

### 3. Change Password

**POST** `/api/auth/change-password`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "currentPassword": "QuickTiger123!",
  "newPassword": "MyNewSecure@Pass123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "QuickTiger123!",
    "newPassword": "MyNewSecure@Pass123"
  }'
```

### 4. Get All Users (Admin/HR Only)

**GET** `/api/users`

**Authentication:** Required (JWT)  
**Authorization:** ADMIN, HR_OFFICER

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "loginId": "OIJODO20220001",
      "email": "john.doe@workzen.com",
      "role": "EMPLOYEE",
      "isActive": true,
      "mustChangePassword": false,
      "createdAt": "2022-01-15T10:00:00.000Z",
      "employee": {
        "employeeId": "OIJODO20220001",
        "firstName": "John",
        "lastName": "Doe",
        "department": "Engineering",
        "designation": "Software Engineer",
        "dateOfJoining": "2022-01-15T00:00:00.000Z"
      }
    }
  ]
}
```

### 5. Get User by ID (Admin/HR Only)

**GET** `/api/users/:id`

**Authentication:** Required (JWT)  
**Authorization:** ADMIN, HR_OFFICER

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "loginId": "OIJODO20220001",
    "email": "john.doe@workzen.com",
    "role": "EMPLOYEE",
    "isActive": true,
    "mustChangePassword": false,
    "lastPasswordChange": "2022-01-16T10:00:00.000Z",
    "createdAt": "2022-01-15T10:00:00.000Z",
    "updatedAt": "2022-01-16T10:00:00.000Z",
    "employee": {
      // Full employee details
    }
  }
}
```

### 6. Register (DISABLED)

**POST** `/api/auth/register`

**Status:** 403 Forbidden

**Response:**
```json
{
  "error": {
    "statusCode": 403,
    "message": "Public registration is disabled. Please contact HR to create your account."
  }
}
```

## Utility Functions

### 1. Login ID Generator

**File:** `src/utils/loginIdGenerator.ts`

```typescript
// Generate login ID
const loginId = await generateLoginId('John', 'Doe', 2022);
// Returns: "OIJODO20220001"

// Validate login ID format
const isValid = validateLoginIdFormat('OIJODO20220001');
// Returns: true

// Parse login ID
const parsed = parseLoginId('OIJODO20220001');
// Returns: {
//   companyCode: 'OI',
//   firstNamePrefix: 'JO',
//   lastNamePrefix: 'DO',
//   joiningYear: 2022,
//   serialNumber: '0001'
// }
```

### 2. Password Generator

**File:** `src/utils/passwordGenerator.ts`

```typescript
// Generate secure random password
const password = generateSecurePassword(12);
// Returns: "A7#mK2pQ9*xZ"

// Generate memorable temporary password
const tempPassword = generateTemporaryPassword();
// Returns: "QuickTiger123!"
```

## User Onboarding Workflow

### For HR Officers/Admins:

1. **Create New User**
   ```bash
   POST /api/users
   {
     "email": "new.employee@workzen.com",
     "firstName": "New",
     "lastName": "Employee",
     "dateOfJoining": "2024-01-01",
     "department": "Sales"
   }
   ```

2. **Receive Auto-Generated Credentials**
   ```json
   {
     "loginId": "OINEEM20240001",
     "temporaryPassword": "BoldEagle456#"
   }
   ```

3. **Share Credentials with New Employee**
   - Email the loginId and temporary password securely
   - Inform them to change password on first login

### For New Employees:

1. **First Login**
   ```bash
   POST /api/auth/login
   {
     "loginId": "OINEEM20240001",
     "password": "BoldEagle456#"
   }
   ```

2. **Check `mustChangePassword` Flag**
   ```json
   {
     "mustChangePassword": true
   }
   ```

3. **Change Password**
   ```bash
   POST /api/auth/change-password
   {
     "currentPassword": "BoldEagle456#",
     "newPassword": "MySecurePassword@2024"
   }
   ```

4. **Subsequent Logins**
   - Can use either loginId or email
   - `mustChangePassword` is now `false`

## Security Features

### 1. Password Security
- **Bcrypt Hashing**: All passwords hashed with 10 salt rounds
- **Strength Validation**: Enforced on password change
- **Auto-Generated**: Temporary passwords are cryptographically secure
- **Change Tracking**: `lastPasswordChange` timestamp

### 2. Access Control
- **RBAC**: Role-Based Access Control (ADMIN, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE)
- **Protected Endpoints**: JWT authentication required
- **Role Verification**: Specific roles for sensitive operations

### 3. Login ID Security
- **Uniqueness**: Database-level unique constraint
- **Collision Detection**: Automatic serial number increment on conflicts
- **Format Validation**: Regex validation for format compliance

## Testing

### Test with Existing Admin Account

```bash
# 1. Login as Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@workzen.com",
    "password": "Password123!"
  }'

# Copy the JWT token from response

# 2. Create New User
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "test.user@workzen.com",
    "firstName": "Test",
    "lastName": "User",
    "dateOfJoining": "2024-01-01",
    "department": "IT"
  }'

# 3. Login with New User's LoginId
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "OITEUSER20240001",
    "password": "TEMPORARY_PASSWORD_FROM_STEP_2"
  }'

# 4. Change Password
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer NEW_USER_JWT_TOKEN" \
  -d '{
    "currentPassword": "TEMPORARY_PASSWORD",
    "newPassword": "MyNewPassword@2024"
  }'
```

## Migration Notes

### Existing Data Migration

The migration script (`20251108095950_add_login_id_and_employee_fields`) handles:

1. **Added New Fields**:
   - `User.loginId` (unique, required)
   - `User.mustChangePassword` (default: true)
   - `User.lastPasswordChange` (nullable)
   - `Employee.employeeId` (unique, matches User.loginId)
   - `Employee.joiningYear` (extracted from dateOfJoining)

2. **Generated Login IDs for Existing Employees**:
   - Used temporary table with MySQL session variables
   - Serial numbers generated per year
   - Format: `OIJODO20220001` for John Doe (2022)

3. **Handled Users Without Employees**:
   - Generated temporary login IDs: `OIUSER[Year][Hash]`
   - These can be updated when employee record is created

## Troubleshooting

### Common Issues

#### 1. "loginId already exists"
**Cause**: Duplicate login ID (rare, collision detected)  
**Solution**: System auto-increments serial number

#### 2. "Public registration is disabled"
**Cause**: Attempting to use `/api/auth/register` endpoint  
**Solution**: Contact HR/Admin to create account via `/api/users`

#### 3. "Password does not meet requirements"
**Cause**: New password doesn't meet strength requirements  
**Solution**: Ensure password has:
- Min 8 characters
- Uppercase, lowercase, number, special character

#### 4. "Current password is incorrect"
**Cause**: Wrong current password in change request  
**Solution**: Verify current password

#### 5. "New password must be different"
**Cause**: New password same as current  
**Solution**: Choose a different password

## Future Enhancements

### Planned Features:
1. **Email Notifications**: Auto-send credentials to new employees
2. **Password Expiry**: Force password change after X days
3. **Login ID Regeneration**: Admin ability to regenerate login IDs
4. **Bulk User Import**: CSV import for multiple users
5. **Account Activation**: Email verification before first login
6. **Login History**: Track login attempts and history
7. **Password Reset**: Forgot password flow with email verification
8. **2FA Support**: Two-factor authentication

## Related Files

### Core Implementation
- `src/utils/loginIdGenerator.ts` - Login ID generation logic
- `src/utils/passwordGenerator.ts` - Password generation utilities
- `src/routes/users.ts` - User management endpoints
- `src/routes/auth.ts` - Authentication endpoints (updated)
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/20251108095950_add_login_id_and_employee_fields/` - Migration

### Supporting Files
- `src/utils/password.ts` - Password hashing and validation
- `src/utils/jwt.ts` - JWT token management
- `src/middleware/auth.ts` - Auth middleware
- `src/config/database.ts` - Database connection

## Support

For issues or questions:
- Check this documentation
- Review error messages carefully
- Contact system administrator
- Refer to logs: `logs/app.log`

---

**Last Updated:** November 8, 2024  
**Version:** 1.0.0  
**Status:** ✅ Fully Implemented
