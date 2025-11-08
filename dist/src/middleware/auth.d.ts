import { JwtPayload } from '../utils/jwt';
import { Role } from '@prisma/client';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const verifyTokenMiddleware: (req: any, res: any, next: any) => void;
export declare function requireRole(...allowedRoles: Role[]): (req: any, res: any, next: any) => void;
//# sourceMappingURL=auth.d.ts.map