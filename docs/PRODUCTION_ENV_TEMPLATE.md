# Production Environment Template

## Backend (.env)

```bash
# ============================================
# SINI CAR B2B — Production Environment
# ============================================

# Database
DATABASE_URL="postgresql://user:pass@host:5432/sinicar_prod"

# Server
PORT=3005
NODE_ENV=production

# JWT (REQUIRED - min 32 chars)
# Generate: openssl rand -base64 48
JWT_SECRET=<CHANGE-ME-strong-secret-min-32-chars>
JWT_EXPIRES_IN=7d

# CORS (your production domain)
CORS_ORIGIN=https://app.sinicar.com

# API
API_VERSION=v1

# ============================================
# Security — Public Launch Mode
# ============================================

# Rate Limiting (Recommended)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
RATE_LIMIT_MAX_LOGIN=10
RATE_LIMIT_MAX_SEARCH=60

# Auth Cookie Mode (HttpOnly token)
ENABLE_AUTH_COOKIE=true
AUTH_COOKIE_NAME=AUTH_TOKEN

# CSRF Protection (Double-Submit Cookie)
ENABLE_CSRF=true
ENABLE_CSRF_COOKIE=true
```

---

## Frontend (.env)

```bash
# ============================================
# Frontend — Production Environment
# ============================================

# API (same-origin recommended)
VITE_API_URL=https://app.sinicar.com/api/v1

# Security — Cookie Auth Mode
VITE_ENABLE_AUTH_COOKIE_MODE=true
VITE_ENABLE_API_CREDENTIALS=true
VITE_ENABLE_CSRF_HEADERS=true
```

---

## Verification Checklist

Before deployment:

- [ ] `JWT_SECRET` is strong (32+ chars, unique per environment)
- [ ] `CORS_ORIGIN` matches production domain exactly
- [ ] HTTPS is enabled (required for Secure cookies)
- [ ] `DATABASE_URL` points to production database
- [ ] Prisma migrations applied: `npx prisma migrate deploy`

---

## Quick Test Commands

```bash
# Backend
NODE_ENV=production npm start

# Check startup log shows:
# - Rate Limit: ENABLED
# - CSRF Middleware: ENABLED
# - Auth Cookie: ENABLED
```

---

## Rollback to Header Token Mode

If issues arise, revert to header token mode:

```bash
# Backend
ENABLE_AUTH_COOKIE=false
ENABLE_CSRF=false
ENABLE_CSRF_COOKIE=false

# Frontend
VITE_ENABLE_AUTH_COOKIE_MODE=false
VITE_ENABLE_API_CREDENTIALS=false
VITE_ENABLE_CSRF_HEADERS=false
```
