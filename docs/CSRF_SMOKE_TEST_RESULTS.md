# CSRF Smoke Test Results

> **Date**: 2026-01-01  
> **Commit**: `aa1a3df` (includes C8 fixes)  
> **Status**: ❌ PARTIALLY FAILED

---

## Test Environment

| Setting | Value |
|---------|-------|
| Backend Port | 3005 |
| Frontend Port | 3000 |
| ENABLE_CSRF | true |
| ENABLE_CSRF_COOKIE | true |
| CORS_ORIGIN | http://localhost:3000 |
| CSRF Middleware | ENABLED ✅ |

---

## Test Results

| Test | Description | Status | Evidence |
|------|-------------|--------|----------|
| **A** | Cookie Issuance | ❌ FAIL | `document.cookie` empty after login |
| **B** | Header Sending | ❌ FAIL | No cookie = no header to send |
| **C** | Missing Header Rejection | ✅ PASS | 403 `missing_header` |
| **D** | Missing Cookie Rejection | ✅ PASS | 403 `missing_cookie` |
| **E** | Success Path | ❌ FAIL | Blocked by failing A |
| **F** | CORS Sanity | ✅ PASS | No CORS errors |

---

## Evidence: Test A - Cookie Issuance FAIL

### What We Checked
```javascript
// After successful UI login (redirected to dashboard)
document.cookie
// Result: "" (empty string)
```

### Console Logs
- Login status: 200 OK (via UI)
- Auth token stored in localStorage ✅
- XSRF-TOKEN in document.cookie: **NOT FOUND**

---

## Root Cause Analysis

The cookie is likely either:

1. **Not being sent by backend** - `Set-Cookie` header missing from login response
2. **Rejected by browser** - Cross-origin cookie blocked despite `credentials: 'include'`

### Possible Issues

| Issue | Likelihood | Fix |
|-------|------------|-----|
| Frontend not sending `credentials: 'include'` | HIGH | Ensure `VITE_ENABLE_API_CREDENTIALS=true` |
| Browser blocking cross-port cookie | MEDIUM | Use Vite proxy instead of direct cross-origin |
| `ENABLE_CSRF_COOKIE` not reaching backend | LOW | Verify env var |

---

## Next Steps

1. **Verify frontend flags active**:
   ```bash
   npx cross-env VITE_ENABLE_CSRF_HEADERS=true VITE_ENABLE_API_CREDENTIALS=true npm run dev
   ```

2. **Alternative: Use Vite proxy** to avoid cross-origin:
   - Route `/api` through Vite to backend
   - Cookies stay same-origin

3. **Debug Set-Cookie**: Check backend Network tab response for `Set-Cookie` header

---

## Test Credentials

| User | Role | Password |
|------|------|----------|
| user-1 | ادمن (Admin) | 1 |
| user-2 | عميل (Customer) | 1 |
| user-3 | مورد (Supplier) | 1 |
