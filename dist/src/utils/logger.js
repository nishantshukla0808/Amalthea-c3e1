"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaString = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaString}`;
    }
    error(message, error) {
        console.error(this.formatMessage(LogLevel.ERROR, message, {
            error: error?.message || error,
            stack: error?.stack,
        }));
    }
    warn(message, meta) {
        console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }
    info(message, meta) {
        console.log(this.formatMessage(LogLevel.INFO, message, meta));
    }
    debug(message, meta) {
        if (process.env.NODE_ENV === 'development') {
            console.log(this.formatMessage(LogLevel.DEBUG, message, meta));
        }
    }
    request(method, path, statusCode, duration) {
        const level = statusCode >= 500 ? LogLevel.ERROR :
            statusCode >= 400 ? LogLevel.WARN :
                LogLevel.INFO;
        this.formatMessage(level, `${method} ${path} ${statusCode} - ${duration}ms`, null);
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map