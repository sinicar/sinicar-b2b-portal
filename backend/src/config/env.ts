import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ============ JWT Secret Validation ============

const DEFAULT_JWT_SECRET = 'default-secret-change-in-production';
const MIN_JWT_SECRET_LENGTH = 32;

function validateJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Check if secret is missing or using default
  if (!secret || secret === DEFAULT_JWT_SECRET) {
    if (isProduction) {
      console.error(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🚨 FATAL: JWT_SECRET is not configured for production!                       ║
║                                                                               ║
║  You must set a strong JWT_SECRET environment variable.                       ║
║  Requirements:                                                                ║
║    - Minimum ${MIN_JWT_SECRET_LENGTH} characters                                                     ║
║    - Strong entropy (use: openssl rand -base64 48)                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
      `);
      process.exit(1);
    }
    // In development, warn but allow default
    console.warn('[Security] ⚠️ Using default JWT_SECRET - set a strong secret for production');
    return DEFAULT_JWT_SECRET;
  }
  
  // Check secret length
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    if (isProduction) {
      console.error(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🚨 FATAL: JWT_SECRET is too weak!                                            ║
║                                                                               ║
║  Current length: ${secret.length} characters                                              ║
║  Minimum required: ${MIN_JWT_SECRET_LENGTH} characters                                               ║
║  Generate strong secret: openssl rand -base64 48                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
      `);
      process.exit(1);
    }
    console.warn(`[Security] ⚠️ JWT_SECRET is weak (${secret.length} chars < ${MIN_JWT_SECRET_LENGTH}). Use stronger secret for production.`);
  }
  
  return secret;
}

// ============ Environment Configuration ============

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  
  jwt: {
    secret: validateJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  cors: {
    // Support comma-separated origins
    origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:5000']
  },
  
  api: {
    version: process.env.API_VERSION || 'v1'
  },
  
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

export default env;
