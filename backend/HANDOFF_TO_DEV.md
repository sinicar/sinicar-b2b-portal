# SINI CAR B2B Backend - Developer Handoff Guide

## Overview

This document provides comprehensive documentation for the SINI CAR B2B Backend API, designed to replace the frontend's mock API with a production-ready backend.

## Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.x
- **Database**: SQLite (via Prisma ORM 5.22.0)
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Language**: TypeScript 5.x

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── dev.db             # SQLite database file
├── src/
│   ├── config/
│   │   └── env.ts         # Environment configuration
│   ├── lib/
│   │   └── prisma.ts      # Prisma client instance
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── validate.middleware.ts # Zod validation
│   │   └── error.middleware.ts    # Error handling
│   ├── modules/
│   │   ├── auth/          # Authentication module
│   │   ├── customers/     # Customer management
│   │   ├── orders/        # Order processing
│   │   ├── organizations/ # Team management
│   │   ├── installments/  # Installment system
│   │   ├── suppliers/     # Supplier marketplace
│   │   ├── ads/           # Advertising system
│   │   └── tools/         # Trader tools
│   ├── schemas/           # Zod validation schemas
│   ├── utils/
│   │   ├── errors.ts      # Custom error classes
│   │   ├── pagination.ts  # Pagination utilities
│   │   └── response.ts    # Response formatters
│   ├── routes/
│   │   └── index.ts       # Route aggregator
│   └── server.ts          # Application entry point
├── .env                   # Environment variables
└── package.json
```

## Modules Overview

### 1. Auth Module (`/api/v1/auth`)
- `POST /login` - User authentication (owner/staff)
- `POST /register` - New account registration
- `POST /logout` - Session termination
- `GET /me` - Current user profile
- `POST /refresh-token` - Token refresh
- `POST /change-password` - Password update
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset completion

### 2. Customers Module (`/api/v1/customers`)
- Customer profile management
- Branch management
- Document handling
- Search points management

### 3. Orders Module (`/api/v1/orders`)
- Order creation and management
- Status transitions (workflow engine)
- Order history tracking
- Quote requests

### 4. Organizations Module (`/api/v1/organizations`)
- Team management
- Invitation system
- Role-based permissions
- Activity logging

### 5. Installments Module (`/api/v1/installments`)
- Credit request management
- Supplier forwarding
- Offer handling
- Payment schedule generation

### 6. Suppliers Module (`/api/v1/suppliers`)
- Supplier profile management
- Product catalog
- Pricing management
- Order fulfillment

### 7. Ads Module (`/api/v1/ads`)
- Advertiser management
- Campaign creation
- Slot management
- Analytics tracking

### 8. Tools Module (`/api/v1/tools`)
- VIN extraction
- Price comparison
- PDF to Excel conversion
- Usage tracking

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=file:./prisma/dev.db

# Server
NODE_ENV=development
PORT=3001

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your-secure-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5000

# API Version
API_VERSION=v1
```

### Production Security Requirements

1. **JWT_SECRET**: Must be a cryptographically secure random string (min 32 characters)
2. **DATABASE_URL**: Use PostgreSQL for production
3. **CORS_ORIGIN**: Restrict to your production domain

## Setup Instructions

### Development Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Create database
npx prisma db push

# 5. Start development server
npm run dev
```

### Production Setup

```bash
# 1. Install dependencies
npm ci

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. Build TypeScript
npm run build

# 5. Start production server
npm start
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

## Authentication Flow

### 1. Owner Login
```bash
POST /api/v1/auth/login
{
  "identifier": "CLIENT_ID",
  "password": "password123",
  "loginType": "owner"
}
```

### 2. Staff Login
```bash
POST /api/v1/auth/login
{
  "identifier": "OWNER_CLIENT_ID-ACTIVATION_CODE",
  "password": "staffpassword",
  "loginType": "staff"
}
```

### 3. Using Access Token
```bash
Authorization: Bearer <access_token>
```

## Security Considerations

### Implemented Security Features

1. **Password Hashing**: bcrypt with salt rounds of 10
2. **JWT Authentication**: Access tokens (7d) + Refresh tokens (30d)
3. **Rate Limiting**: Login attempts limited to 5 before lockout
4. **Input Validation**: Zod schemas for all endpoints
5. **CORS Protection**: Configurable origin whitelist
6. **Helmet.js**: Security headers middleware

### Production Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting (express-rate-limit)
- [ ] Enable request logging
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Database backups

## Database Migrations

### For Production PostgreSQL

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

3. Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## Testing the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Login Test
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"TEST001","password":"test123","loginType":"owner"}'
```

## Known Limitations

1. **Email Integration**: Password reset stores token in database but does NOT return it in API response. **You MUST integrate with an email service (SendGrid, AWS SES, etc.) to send reset tokens to users before deploying to production.**
2. **File Upload**: Not implemented (add multer for document uploads)
3. **Real-time Updates**: No WebSocket support (add Socket.io for live updates)
4. **Search**: Basic search only (add Elasticsearch for advanced search)

## Future Enhancements

1. Add Redis for session management
2. Implement webhook notifications
3. Add GraphQL support
4. Integrate with payment gateway
5. Add SMS notifications via Twilio
6. Implement audit logging

## Support

For questions or issues, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 2024
