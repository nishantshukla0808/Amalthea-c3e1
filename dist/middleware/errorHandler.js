"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = globalErrorHandler;
exports.notFoundHandler = notFoundHandler;
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = require("../utils/logger");
function globalErrorHandler(err, req, res, next) {
    logger_1.logger.error(`Error in ${req.method} ${req.path}`, err);
    return (0, errorHandler_1.sendErrorResponse)(res, err);
}
function notFoundHandler(req, res) {
    return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
    });
}
//# sourceMappingURL=errorHandler.js.map