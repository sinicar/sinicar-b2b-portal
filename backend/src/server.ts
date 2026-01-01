import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { validateCsrf } from './security/csrf';
import { authCookieBridge } from './middlewares/authCookieBridge';

// Feature flags
const enableCsrf = process.env.ENABLE_CSRF === 'true';
const enableAuthCookie = process.env.ENABLE_AUTH_COOKIE === 'true';

const app = express();

app.use(helmet());

app.use(cors({
  origin: env.cors.origin,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (required for CSRF and auth cookie)
app.use(cookieParser());

// Auth cookie bridge (reads cookie, sets Authorization header) - feature-flagged, OFF by default
if (enableAuthCookie) {
  app.use(authCookieBridge);
}

// CSRF protection (feature-flagged, OFF by default)
if (enableCsrf) {
  app.use(validateCsrf);
}

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: env.api.version
  });
});

app.use(`/api/${env.api.version}`, routes);

app.use(notFoundHandler);
app.use(errorHandler);

function startServer() {
  app.listen(env.port, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║     SINI CAR B2B Backend API Server              ║
╠══════════════════════════════════════════════════╣
║  Environment: ${env.nodeEnv.padEnd(33)}║
║  Port: ${env.port.toString().padEnd(40)}║
║  API Version: ${env.api.version.padEnd(33)}║
║  CORS Origin: ${(Array.isArray(env.cors.origin) ? env.cors.origin.join(', ') : env.cors.origin).slice(0, 30).padEnd(33)}║
║  CSRF Middleware: ${(enableCsrf ? 'ENABLED' : 'DISABLED').padEnd(29)}║
║  Auth Cookie: ${(enableAuthCookie ? 'ENABLED' : 'DISABLED').padEnd(33)}║
╚══════════════════════════════════════════════════╝
    `);
  });
}

// Start server if this is the main module
const isMainModule = require.main === module || process.argv[1]?.includes('server');
if (isMainModule) {
  startServer();
}

export { app, startServer };
export default app;

