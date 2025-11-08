import { User } from '@prisma/client';
export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    employeeId?: string;
}
export declare function generateToken(user: User): string;
export declare function verifyToken(token: string): JwtPayload;
export declare function extractTokenFromHeader(authHeader: string | undefined): string;
//# sourceMappingURL=jwt.d.ts.map