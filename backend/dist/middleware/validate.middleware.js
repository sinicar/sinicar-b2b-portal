"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
const response_1 = require("../utils/response");
function validate(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    if (!errors[path])
                        errors[path] = [];
                    errors[path].push(err.message);
                });
                return (0, response_1.validationError)(res, errors);
            }
            next(error);
        }
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    if (!errors[path])
                        errors[path] = [];
                    errors[path].push(err.message);
                });
                return (0, response_1.validationError)(res, errors);
            }
            next(error);
        }
    };
}
//# sourceMappingURL=validate.middleware.js.map