"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.cors.origin,
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: env_1.env.api.version
    });
});
app.use(`/api/${env_1.env.api.version}`, routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
function startServer() {
    app.listen(env_1.env.port, () => {
        console.log(`
╔══════════════════════════════════════════════════╗
║     SINI CAR B2B Backend API Server              ║
╠══════════════════════════════════════════════════╣
║  Environment: ${env_1.env.nodeEnv.padEnd(33)}║
║  Port: ${env_1.env.port.toString().padEnd(40)}║
║  API Version: ${env_1.env.api.version.padEnd(33)}║
║  CORS Origin: ${env_1.env.cors.origin.padEnd(33)}║
╚══════════════════════════════════════════════════╝
    `);
    });
}
// Start server if this is the main module
const isMainModule = require.main === module || process.argv[1]?.includes('server');
if (isMainModule) {
    startServer();
}
exports.default = app;
//# sourceMappingURL=server.js.map