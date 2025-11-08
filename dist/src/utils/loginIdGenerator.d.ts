export declare function generateLoginId(firstName: string, lastName: string, joiningYear: number): Promise<string>;
export declare function validateLoginIdFormat(loginId: string): boolean;
export declare function parseLoginId(loginId: string): {
    companyCode: string;
    firstNamePrefix: string;
    lastNamePrefix: string;
    joiningYear: number;
    serialNumber: string;
} | null;
//# sourceMappingURL=loginIdGenerator.d.ts.map