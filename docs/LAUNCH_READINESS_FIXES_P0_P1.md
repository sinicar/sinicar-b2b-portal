# P0/P1 Launch Readiness Fixes

**Implemented**: 2026-01-01  
**Verify**: ✅ Passed

---

## Summary

| Item | Commit | Status |
|------|--------|--------|
| P0-1 Rate Limiting | `pending` | ✅ Done |
| P0-2 Secrets Audit | `pending` | ✅ No exposure |
| P0-3 JWT Secret | `pending` | ✅ Done |
| P1-1 Request ID | `pending` | ✅ Done |
| P1-2 Structured Logs | `pending` | ✅ Done |

---

## P0-1: Global Rate Limiting

### Files Created/Modified

- `backend/src/middleware/rateLimit.middleware.ts` (NEW)
- `backend/src/server.ts` (wired middleware)
- `backend/.env.example` (added flags)

### Environment Variables

```bash
RATE_LIMIT_ENABLED=false       # Set true to enable
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX=300             # General API limit
RATE_LIMIT_MAX_LOGIN=10        # Auth endpoints
RATE_LIMIT_MAX_SEARCH=60       # Search endpoints
```

### Testing

```bash
# Enable rate limiting
RATE_LIMIT_ENABLED=true npm run dev

# Watch for Rate Limit: ENABLED in startup log
# Trigger limit: repeat requests > max
# Expect: 429 Too Many Requests
```

---

## P0-2: Secrets Audit

**Result**: ✅ No exposure found

- `GEMINI_API_KEY` defined in vite.config but **not used** in frontend code
- No sensitive keys in `src/` directory

---

## P0-3: JWT Secret Enforcement

### File Modified

- `backend/src/config/env.ts`

### Behavior

| Environment | Secret Missing/Weak | Action |
|-------------|---------------------|--------|
| Development | Allowed | Warning log |
| Production | Blocked | Exit with error |

### Requirements

- Minimum 32 characters
- Generate: `openssl rand -base64 48`

---

## P1-1: Request ID Middleware

### File Created

- `backend/src/middleware/requestId.middleware.ts`

### Features

- UUID generated per request
- `X-Request-Id` response header
- Attached to `req.requestId`

### Testing

```bash
curl -I http://localhost:3005/health
# Look for: X-Request-Id: <uuid>
```

---

## P1-2: Structured Logging

### Updates

- `backend/src/middleware/error.middleware.ts`

### Format

```json
{
  "timestamp": "2026-01-01T08:00:00.000Z",
  "level": "error",
  "requestId": "abc-123",
  "path": "/api/v1/orders",
  "method": "POST",
  "error": "Validation failed"
}
```

---

## Smoke Tests

| # | Test | Expected |
|---|------|----------|
| 1 | Login | 200 + token |
| 2 | Check X-Request-Id | Header present |
| 3 | Enable rate limit + spam | 429 after max |
| 4 | Set weak JWT in prod | Server exits |
| 5 | Logout | Session cleared |

---

## Production Flags

```bash
# Backend (.env)
NODE_ENV=production
JWT_SECRET=<strong 32+ char secret>
RATE_LIMIT_ENABLED=true
ENABLE_AUTH_COOKIE=true
ENABLE_CSRF=true
ENABLE_CSRF_COOKIE=true

# Frontend (.env)
VITE_ENABLE_AUTH_COOKIE_MODE=true
VITE_ENABLE_API_CREDENTIALS=true
VITE_ENABLE_CSRF_HEADERS=true
```

---

## Verify Output

```
npm run verify
✅ check:deps — Clean
✅ typecheck — Pass
✅ build — 8.89s
```
