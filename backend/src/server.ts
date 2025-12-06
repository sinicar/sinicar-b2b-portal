import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app = express();

app.use(helmet());

app.use(cors({
  origin: env.cors.origin,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
║  CORS Origin: ${env.cors.origin.padEnd(33)}║
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
