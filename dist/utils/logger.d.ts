export declare enum LogLevel {
    ERROR = "ERROR",
    WARN = "WARN",
    INFO = "INFO",
    DEBUG = "DEBUG"
}
declare class Logger {
    private formatMessage;
    error(message: string, error?: Error | any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    request(method: string, path: string, statusCode: number, duration: number): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map