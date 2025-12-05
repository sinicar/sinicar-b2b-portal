import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';

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

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = env.isProduction 
    ? 'حدث خطأ في الخادم'
    : err.message || 'Internal Server Error';
    
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.isDevelopment && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'المسار غير موجود'
  });
});

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

export default app;
