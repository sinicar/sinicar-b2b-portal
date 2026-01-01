# CSRF Smoke Test Results

> **Date**: 2026-01-01
> **Status**: ❌ FAILED - Requires Fix
> **Tester**: Automated Browser Test

## Execution Notes

**Test executed with CSRF flags enabled:**
- Backend: `ENABLE_CSRF=true`, `ENABLE_CSRF_COOKIE=true`
- Frontend: `VITE_ENABLE_CSRF_HEADERS=true`

---

## Test Results Summary

| Test | Description | Status | Notes |
|------|-------------|--------|-------|
| **A** | Login Cookie Issuance | ❌ FAIL | Cookie NOT set after login |
| **B** | Header Sending | ⚠️ N/A | Cannot test - no cookie |
| **C** | Missing Header (403) | ⚠️ N/A | Cannot test - no cookie |
| **D** | Missing Cookie (403) | ✅ PASS | Logout returns 403 with `reason: missing_cookie` |
| **E** | Success Path | ❌ FAIL | Blocked by missing cookie |
| **F** | CORS Sanity | ⚠️ ISSUE | Cross-origin cookie not sent |

---

## Detailed Findings

### Test A: Login Cookie Issuance ❌

**Steps Performed:**
1. Navigated to http://localhost:3000
2. Logged in with `user-1` / `1`
3. Login succeeded - redirected to Admin Dashboard
4. Checked `document.cookie`

**Result:** XSRF-TOKEN cookie **NOT FOUND**

**Evidence:**
```javascript
document.cookie
// Returns: "" (empty string)
```

---

### Test D: Missing Cookie Validation ✅

**Steps Performed:**
1. Attempted logout while logged in
2. Backend returned 403

**Result:** Backend correctly rejects requests with missing cookie

**Evidence:**
```json
{
  "error": "CSRF validation failed",
  "code": "CSRF_INVALID", 
  "reason": "missing_cookie"
}
```

---

## Root Cause Analysis

### Issue 1: Cross-Origin Cookie Not Set

The frontend runs on `localhost:3000` and backend on `localhost:3005`.

**Problem:** The `res.cookie()` call in `issueCsrfCookie.ts` sets the cookie, but it's bound to the backend's origin (port 3005), not the frontend's origin (port 3000).

**Solution Options:**

1. **Option A (Recommended):** Add `credentials: 'include'` to fetch requests
   - File: `src/services/apiClient.ts`
   - Add to fetch options: `credentials: 'include'`

2. **Option B:** Change `sameSite` from `strict` to `lax`
   - File: `backend/src/security/csrf/csrfConfig.ts`
   - For cross-port dev environment

3. **Option C:** Use Vite proxy to route `/api` through same origin
   - Already may be configured in `vite.config.ts`

---

## Proposed Fix (Smallest Change)

### File: `src/services/apiClient.ts`

```diff
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
+   credentials: 'include', // Send cookies cross-origin
    headers,
  });
```

### File: `backend/src/security/csrf/csrfConfig.ts`

```diff
  export const getCsrfCookieOptions = () => ({
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
-   sameSite: 'strict' as const,
+   sameSite: 'lax' as const, // Allow cross-port in dev
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
```

### Backend CORS (if needed)

Ensure CORS allows credentials:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## Production Safety Confirmation

| Setting | Default Value | Status |
|---------|---------------|--------|
| `ENABLE_CSRF` | `false` (OFF) | ✅ Safe |
| `ENABLE_CSRF_COOKIE` | `false` (OFF) | ✅ Safe |
| `VITE_ENABLE_CSRF_HEADERS` | Not set = OFF | ✅ Safe |

✅ **All flags default to OFF — production behavior unchanged.**

---

## Next Steps

1. [ ] Apply the proposed fix for `credentials: 'include'`
2. [ ] Change `sameSite` to `'lax'` for dev environment
3. [ ] Re-run smoke tests A-F
4. [ ] Document final results

---

## Test Credentials Used

| User | Role | Password |
|------|------|----------|
| user-1 | ادمن (Admin) | 1 |
| user-2 | عميل (Customer) | 1 |
| user-3 | مورد (Supplier) | 1 |
