# Auth Cookie Migration Plan

## Overview

This document describes the dual-auth cookie mode, which migrates token storage from `localStorage` (XSS vulnerable) to HttpOnly cookies.

**Why?**
- Reduces XSS attack surface
- Aligns with CSRF protection work (Phase 8)
- Prepares for future cookie-only authentication

---

## Supported Modes

### A) Header Token Mode (Default)

| Component | Behavior |
|-----------|----------|
| Token Storage | `localStorage.auth_token` |
| Auth Header | `Authorization: Bearer <token>` |
| Cookie | Not used |

### B) Cookie Mode (Optional)

| Component | Behavior |
|-----------|----------|
| Token Storage | HttpOnly `AUTH_TOKEN` cookie |
| Auth Header | Injected by backend middleware |
| localStorage | Token NOT stored |

---

## Feature Flags

### Backend (`backend/.env`)

| Flag | Default | Description |
|------|---------|-------------|
| `ENABLE_AUTH_COOKIE` | `false` | Issue HttpOnly cookie on login |
| `AUTH_COOKIE_NAME` | `AUTH_TOKEN` | Cookie name |

### Frontend (`.env`)

| Flag | Default | Description |
|------|---------|-------------|
| `VITE_ENABLE_AUTH_COOKIE_MODE` | `false` | Skip localStorage token write |
| `VITE_ENABLE_API_CREDENTIALS` | `false` | Send cookies with requests |

---

## Dev Setup

### 1. Start Backend

```bash
cd backend
npx cross-env ENABLE_AUTH_COOKIE=true ENABLE_CSRF=true npm run dev
```

### 2. Start Frontend

```bash
cd ..
npx cross-env VITE_ENABLE_AUTH_COOKIE_MODE=true VITE_ENABLE_API_CREDENTIALS=true npm run dev
```

### 3. Verify in DevTools

After login:
- **Cookies tab**: `AUTH_TOKEN` present (HttpOnly)
- **Local Storage**: `auth_token` absent
- **Console**: `[AuthCookieBridge] Set Authorization header from cookie`

---

## Smoke Tests

1. Login → Dashboard loads
2. Navigate to admin pages → No 401 errors
3. Refresh page → Session persists
4. API calls succeed without explicit Authorization header

---

## Rollback Plan

1. Set all flags to `false`
2. Clear browser cookies and localStorage
3. Restart backend and frontend
4. Verify login works with localStorage token

---

## Production Notes

- **Same-origin deployment recommended**
- For cross-subdomain: configure `AUTH_COOKIE_DOMAIN` (future)
- HTTPS required in production (`Secure` flag auto-enabled)

---

## Known Gaps / Next Steps

| Gap | Priority | Status |
|-----|----------|--------|
| Logout endpoint to clear cookie | ~~High~~ | ✅ Done (`clearAuthCookie`) |
| Cookie refresh strategy | Medium | Pending |
| Disable JSON accessToken in cookie mode | Low | Future |
| Cookie domain for subdomains | Low | Future |

---

## Go/No-Go Checklist

Before enabling cookie mode broadly, all smoke tests must PASS:

- [ ] T5 - Cookie issued, no localStorage token
- [ ] T6 - API requests work via cookie bridge
- [ ] T7 - Logout clears AUTH_TOKEN cookie
- [ ] T8 - Session terminates properly on logout
- [ ] T10 - No regressions in admin views

See [Auth Cookie Smoke Test Results](./AUTH_COOKIE_SMOKE_TEST_RESULTS.md) for detailed test matrix.

---

## Related Docs

- [CSRF Cookie Auth Design](./CSRF_COOKIE_AUTH_DESIGN.md)
- [CSRF Smoke Test Results](./CSRF_SMOKE_TEST_RESULTS.md)
- [Auth Cookie Smoke Test Results](./AUTH_COOKIE_SMOKE_TEST_RESULTS.md)

