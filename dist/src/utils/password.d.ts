export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
export declare function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=password.d.ts.map