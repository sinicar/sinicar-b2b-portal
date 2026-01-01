# CSRF Smoke Test Results

> **Date**: 2026-01-01
> **Status**: ⚠️ Requires Manual Execution
> **Tester**: User (Manual Testing Required)

## Execution Notes

**Automated testing blocked by:**
1. `.env` files are gitignored — cannot modify programmatically
2. Backend startup requires manual `.env` configuration
3. Tests A-F must be executed manually by user

**Action Required:** Follow setup instructions below, then run tests manually.

### Backend (`backend/.env`)

```env
ENABLE_CSRF=true
ENABLE_CSRF_COOKIE=true
```

### Frontend (`.env.local` or inline)

```env
VITE_ENABLE_CSRF_HEADERS=true
```

---

## Test Cases

### Test A: Login Cookie Issuance

| Step | Expected | Result |
|------|----------|--------|
| 1. Start backend with CSRF flags enabled | Server starts | ⏳ Pending |
| 2. Start frontend with CSRF header flag enabled | Dev server starts | ⏳ Pending |
| 3. Navigate to login page | Login form appears | ⏳ Pending |
| 4. Login with valid credentials | Login succeeds | ⏳ Pending |
| 5. Open DevTools → Application → Cookies | `XSRF-TOKEN` cookie present | ⏳ Pending |
| 6. Verify cookie properties | `HttpOnly: false`, `SameSite: Strict` | ⏳ Pending |

---

### Test B: Header Sending

| Step | Expected | Result |
|------|----------|--------|
| 1. With login completed, open Network tab | Network tab open | ⏳ Pending |
| 2. Trigger a POST/PUT/DELETE request | Request sent | ⏳ Pending |
| 3. Inspect request headers | `X-CSRF-Token` header present | ⏳ Pending |
| 4. Verify header value matches cookie | Values match | ⏳ Pending |

---

### Test C: Missing Header Test (Force Fail)

| Step | Expected | Result |
|------|----------|--------|
| 1. Set `VITE_ENABLE_CSRF_HEADERS=false` | Flag disabled | ⏳ Pending |
| 2. Restart frontend dev server | Server restarts | ⏳ Pending |
| 3. Trigger a POST/PUT/DELETE request | Request sent WITHOUT header | ⏳ Pending |
| 4. Expect 403 response | `{ error: "CSRF validation failed", reason: "missing_header" }` | ⏳ Pending |

---

### Test D: Missing Cookie Test (Force Fail)

| Step | Expected | Result |
|------|----------|--------|
| 1. Re-enable `VITE_ENABLE_CSRF_HEADERS=true` | Flag enabled | ⏳ Pending |
| 2. Restart frontend dev server | Server restarts | ⏳ Pending |
| 3. Delete `XSRF-TOKEN` cookie in DevTools | Cookie removed | ⏳ Pending |
| 4. Trigger a POST/PUT/DELETE request | Request sent WITH header but no cookie | ⏳ Pending |
| 5. Expect 403 response | `{ error: "CSRF validation failed", reason: "missing_cookie" }` | ⏳ Pending |

---

### Test E: Success Path

| Step | Expected | Result |
|------|----------|--------|
| 1. Login again to re-issue cookie | Cookie restored | ⏳ Pending |
| 2. Ensure frontend flag enabled | `VITE_ENABLE_CSRF_HEADERS=true` | ⏳ Pending |
| 3. Trigger a POST/PUT/DELETE request | Request sent with valid header + cookie | ⏳ Pending |
| 4. Expect success response | 200 or 201 status | ⏳ Pending |

---

### Test F: CORS Sanity

| Step | Expected | Result |
|------|----------|--------|
| 1. Check Console for CORS errors | No CORS errors | ⏳ Pending |
| 2. Verify `credentials: include` working | Cookies sent cross-origin | ⏳ Pending |

---

## Summary

| Test | Description | Status |
|------|-------------|--------|
| A | Login Cookie Issuance | ⏳ Pending |
| B | Header Sending | ⏳ Pending |
| C | Missing Header (403) | ⏳ Pending |
| D | Missing Cookie (403) | ⏳ Pending |
| E | Success Path | ⏳ Pending |
| F | CORS Sanity | ⏳ Pending |

---

## Issues Found

_None yet - pending manual testing_

---

## Fixes Required

_None yet - pending manual testing_

---

## Production Safety Confirmation

| Setting | Default Value | Notes |
|---------|---------------|-------|
| `ENABLE_CSRF` (backend) | `false` (OFF) | Validation middleware disabled |
| `ENABLE_CSRF_COOKIE` (backend) | `false` (OFF) | No cookie issued on login |
| `VITE_ENABLE_CSRF_HEADERS` (frontend) | Not set = OFF | No CSRF header sent |

✅ **All flags default to OFF — production behavior unchanged.**

---

## Manual Test Instructions

### Quick Start

```bash
# Terminal 1: Backend
cd backend
# Edit .env to add:
#   ENABLE_CSRF=true
#   ENABLE_CSRF_COOKIE=true
npm run dev

# Terminal 2: Frontend
cd ..
# Create .env.local with:
#   VITE_ENABLE_CSRF_HEADERS=true
npm run dev
```

### After Testing

1. Update this document with test results
2. Mark each test as ✅ PASS or ❌ FAIL
3. Document any issues in "Issues Found" section
4. Commit updated results

---

## Next Steps (After Testing)

1. If all tests pass → CSRF implementation is production-ready
2. If issues found → Fix and re-test
3. Update design doc with any learnings
