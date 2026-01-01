# SINI CAR B2B — Launch Readiness Audit

**Audit Date**: 2026-01-01  
**Auditor**: Automated Code Review  
**Status**: READ-ONLY (no code changes)

---

## Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| **Portal Connectivity** | ✅ 8/10 | Ready |
| **Security & Auth** | ⚠️ 6/10 | P0/P1 fixes required |
| **API Robustness** | ✅ 8/10 | Ready |
| **Performance** | ⚠️ 7/10 | Optimization needed |
| **Scalability** | ⚠️ 5/10 | Major work for 1M+ ops |
| **Observability** | ⚠️ 4/10 | Minimal monitoring |

### Go/No-Go Decision

| Deployment Type | Decision | Conditions |
|-----------------|----------|------------|
| Internal VPN/Staging | ✅ GO | P0 security items first |
| Public Internet | ⚠️ CONDITIONAL | Resolve P0+P1 items |

---

## 1. Portal Connectivity & Data Flow

### ✅ Verified

- **API Base**: All portals use `/api/v1` via Vite proxy (`vite.config.ts:13`)
- **Auth Flow**: Single JWT-based auth in `backend/src/middleware/auth.middleware.ts`
- **Routes**: 30 backend modules, 136-line route index (`backend/src/routes/index.ts`)

### ⚠️ Issues

| Issue | Impact | Location | Fix |
|-------|--------|----------|-----|
| Stub routes for `order-shortages` | Missing feature | `routes/index.ts:87-104` | Implement or remove |
| 2 Vite warnings (dynamic imports) | Not breaking | `api.ts`, `supabaseClient.ts` | Refactor imports |

### Middleman Isolation

**Status**: ✅ ENFORCED

- `SupplierRequestAssignment` model (`schema.prisma:548-566`) isolates suppliers from customers
- `hideRealSupplierFromCustomer` setting in `SupplierMarketplaceSettings`
- No direct customer→supplier data exposure in API responses

---

## 2. Security & Auth

### Current State

| Feature | Status | Location |
|---------|--------|----------|
| Auth Mode | Header Token (localStorage) | Default |
| Cookie Mode | Flagged, OFF | `ENABLE_AUTH_COOKIE` |
| CSRF | Flagged, OFF | `ENABLE_CSRF` |
| CORS | Configurable | `backend/src/server.ts:19-22` |
| Helmet | ✅ Enabled | `backend/src/server.ts:17` |

### 🚨 P0 (Critical)

| Issue | Impact | Location | Fix |
|-------|--------|----------|-----|
| **No global rate-limiting** | DoS vulnerability | `backend/src/server.ts` | Add `express-rate-limit` middleware |
| **GEMINI_API_KEY in bundle** | API key exposure | `vite.config.ts:22-23` | Move to backend only |
| **Weak JWT default** | Token forgery risk | `backend/src/config/env.ts:12` | Require strong secret |

### ⚠️ P1 (High)

| Issue | Impact | Location | Fix |
|-------|--------|----------|-----|
| Token in localStorage | XSS can steal token | `src/services/apiClient.ts:18` | Enable cookie mode |
| No request ID tracing | Hard to debug | Global | Add `uuid` per request |
| CSRF OFF by default | CSRF attacks | `backend/src/server.ts:12` | Enable in production |

### Cookie Settings (Production)

```bash
# Backend
ENABLE_AUTH_COOKIE=true
AUTH_COOKIE_NAME=AUTH_TOKEN
ENABLE_CSRF=true
ENABLE_CSRF_COOKIE=true

# Frontend
VITE_ENABLE_AUTH_COOKIE_MODE=true
VITE_ENABLE_API_CREDENTIALS=true
VITE_ENABLE_CSRF_HEADERS=true
```

---

## 3. API Contracts & Backend

### ✅ Verified

| Check | Status | Evidence |
|-------|--------|----------|
| Prisma schema | 1367 lines, 50+ models | `backend/prisma/schema.prisma` |
| Validation middleware | Zod schemas | `backend/src/middleware/validate.middleware.ts` |
| Error handling | Centralized | `backend/src/middleware/error.middleware.ts` |
| Auth middleware | JWT verification | `backend/src/middleware/auth.middleware.ts` |

### Database Indexes

| Table | Indexes | Status |
|-------|---------|--------|
| `User` | `clientId` unique | ✅ |
| `Product` | `partNumber` unique | ✅ |
| `Notification` | 4 indexes (userId, isRead, createdAt, event) | ✅ |
| `MessageLog` | 5 indexes | ✅ |
| `Order` | userId FK | ⚠️ Consider index |

### ⚠️ Potential Issues

| Issue | Impact | Location |
|-------|--------|----------|
| No pagination limits | Memory exhaustion | Various services |
| Large JSON in `metadata` columns | Slow queries | Multiple models |
| No read replicas | Write/read contention | Infrastructure |

---

## 4. Performance & Bundling

### Build Output (npm run verify)

```
✓ 2860 modules transformed
✓ built in 8.96s
```

### Bundle Analysis

| Chunk | Size | Gzip | Status |
|-------|------|------|--------|
| `vendor-CF0IAbS5.js` | 1,662 kB | 518 kB | ⚠️ Large |
| `index-D0D-j0G4.js` | 1,571 kB | 351 kB | ⚠️ Large |
| `react-vendor` | 294 kB | 83 kB | ✅ OK |
| `charts` | 248 kB | 58 kB | ✅ OK |
| CSS | 193 kB | 25 kB | ✅ OK |

### P2 Optimizations

- Split `vendor.js` further (supabase, xlsx, date-fns)
- Lazy-load admin pages (already partial)
- Move static imports of `api.ts` to dynamic

---

## 5. Scalability & Capacity

### What Breaks First

| Scale | Bottleneck | Risk |
|-------|------------|------|
| 10k ops/day | None | ✅ Current stack OK |
| 100k ops/day | DB connections | Medium |
| 1M ops/day | Single node, no cache | High |
| 100M ops/day | Everything | Critical |

### Architecture Gaps

| Component | Current | Required for Scale |
|-----------|---------|-------------------|
| **Database** | Single Postgres | Read replicas, connection pooling |
| **Caching** | None | Redis for sessions, queries |
| **Search** | Prisma queries | Elasticsearch for products |
| **File Storage** | Local/inline | S3/Object storage |
| **Background Jobs** | None | Bull/BullMQ for imports |
| **Rate Limiting** | Per-service only | Global Redis-based |
| **Horizontal Scale** | Not supported | Stateless backend + LB |

### Scalability Roadmap

| Phase | Target | Work |
|-------|--------|------|
| Phase 1 | 10k/day | Current (optimize queries) |
| Phase 2 | 100k/day | Redis cache, connection pool |
| Phase 3 | 1M/day | Read replicas, CDN, search engine |
| Phase 4 | 100M/day | Sharding, Kafka, microservices |

---

## 6. Observability & Reliability

### Current State

| Feature | Status | Evidence |
|---------|--------|----------|
| Error Boundary | ✅ | `src/components/error/AppErrorBoundary.tsx` |
| Activity Logs | ✅ | `ActivityLog` table + routes |
| Server Logging | Basic `console.log` | `backend/src/server.ts` |
| Request IDs | ❌ None | - |
| APM/Tracing | ❌ None | - |
| Health Check | ✅ `/health` | `backend/src/server.ts:40` |

### Minimum Monitoring (P1)

1. **Sentry** for error tracking (frontend + backend)
2. **Request ID** middleware
3. **Structured logging** (pino/winston)
4. **Uptime monitoring** (UptimeRobot/Pingdom)

### Disaster Recovery

| Item | Status |
|------|--------|
| DB Backups | ⚠️ Unknown (check hosting) |
| Migration rollback | ✅ Prisma migrate |
| Secrets rotation | ⚠️ Manual |

---

## 7. Launch Readiness

### Minimum Launch Checklist (Internal)

- [ ] Set strong `JWT_SECRET` in production
- [ ] Remove `GEMINI_API_KEY` from vite.config
- [ ] Add global rate-limit middleware
- [ ] Enable HTTPS (via reverse proxy)
- [ ] Configure CORS for production domain
- [ ] Run Prisma migrations
- [ ] Seed required data (roles, permissions)

### Post-Launch Hardening (Public)

- [ ] Enable CSRF + Auth Cookie mode
- [ ] Add Sentry error tracking
- [ ] Add request ID tracing
- [ ] Set up monitoring/alerts
- [ ] Configure Redis for caching
- [ ] Review all API endpoints for auth
- [ ] Penetration testing

---

## Smoke Tests (Critical Flows)

| # | Flow | Steps |
|---|------|-------|
| S1 | Login | POST /auth/login → 200 + token |
| S2 | Dashboard | GET /admin/stats → 200 |
| S3 | Products | GET /products/search → 200 |
| S4 | Quote | POST /quotes → 201 |
| S5 | Order | POST /orders → 201 |
| S6 | Status Update | PATCH /orders/:id/status → 200 |
| S7 | Notifications | GET /notifications → 200 |
| S8 | Logout | POST /auth/logout → 200 |
| S9 | Session Clear | Verify no token/cookie after logout |
| S10 | Supplier Isolation | Supplier cannot see customer names |

---

## 8. Security Modes

### Header Token Mode (Development/Internal)

Default mode. Token stored in localStorage.

```bash
# Backend — all security OFF
ENABLE_AUTH_COOKIE=false
ENABLE_CSRF=false
RATE_LIMIT_ENABLED=false

# Frontend
VITE_ENABLE_AUTH_COOKIE_MODE=false
VITE_ENABLE_CSRF_HEADERS=false
```

**When to use**: Development, internal VPN, staging.

---

### Cookie Mode (Public Production)

HttpOnly cookie for auth token, CSRF protection enabled.

```bash
# Backend
ENABLE_AUTH_COOKIE=true
ENABLE_CSRF=true
ENABLE_CSRF_COOKIE=true
RATE_LIMIT_ENABLED=true
CORS_ORIGIN=https://app.sinicar.com

# Frontend
VITE_ENABLE_AUTH_COOKIE_MODE=true
VITE_ENABLE_API_CREDENTIALS=true
VITE_ENABLE_CSRF_HEADERS=true
```

**When to use**: Public internet, production.

---

### Rollback Steps

If cookie mode causes issues:

1. **Backend**: Set all `ENABLE_*` to `false`
2. **Frontend**: Set all `VITE_ENABLE_*` to `false`
3. Restart both servers
4. Users will need to re-login

No code changes required.

---

## 9. Final Public Smoke Tests

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| P1 | Login | `Set-Cookie: AUTH_TOKEN=...; HttpOnly` | ⬜ |
| P2 | Login | `Set-Cookie: XSRF-TOKEN=...` | ⬜ |
| P3 | Authenticated GET | Works with cookie | ⬜ |
| P4 | POST without X-XSRF-TOKEN | 403 Forbidden | ⬜ |
| P5 | POST with X-XSRF-TOKEN | 200 OK | ⬜ |
| P6 | Logout | Cookies cleared | ⬜ |
| P7 | Rate limit spam | 429 after limit | ⬜ |
| P8 | X-Request-Id | Header present | ⬜ |
| P9 | Supplier isolation | No customer data visible | ⬜ |
| P10 | Admin can see all | Full dashboard works | ⬜ |

---

## Go/No-Go Final Decision

| Mode | Status | Condition |
|------|--------|-----------|
| Internal (Header) | ✅ GO | Now |
| Public (Cookie) | ⚠️ CONDITIONAL | Pass P1-P10 smoke tests |

---

## Related Docs

- [PRODUCTION_ENV_TEMPLATE.md](./PRODUCTION_ENV_TEMPLATE.md)
- [AUTH_COOKIE_MIGRATION.md](./AUTH_COOKIE_MIGRATION.md)
- [AUTH_COOKIE_SMOKE_TEST_RESULTS.md](./AUTH_COOKIE_SMOKE_TEST_RESULTS.md)
- [CSRF_COOKIE_AUTH_DESIGN.md](./CSRF_COOKIE_AUTH_DESIGN.md)
- [LAUNCH_READINESS_FIXES_P0_P1.md](./LAUNCH_READINESS_FIXES_P0_P1.md)
