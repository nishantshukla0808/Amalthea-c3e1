"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../utils/logger");
function requestLogger(req, res, next) {
    const startTime = Date.now();
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - startTime;
        logger_1.logger.request(req.method, req.path, res.statusCode, duration);
        return originalEnd.apply(this, args);
    };
    next();
}
//# sourceMappingURL=requestLogger.js.map