# CSRF & Cookie-Based Authentication Design

> **Document Type**: Design & Architecture (NO CODE CHANGES)
> **Status**: Pre-Implementation Planning
> **Last Updated**: 2026-01-01

---

## 1. Executive Summary

### Why This Migration Is Required

**Current State**: The SINI CAR B2B platform stores JWT access tokens in `localStorage` and sends them via `Authorization: Bearer` headers.

**The Problem**: This approach exposes tokens to **Cross-Site Scripting (XSS)** attacks. Any injected JavaScript can read `localStorage` and exfiltrate tokens, granting attackers full access to user sessions.

**The Solution**: Store tokens in **HttpOnly cookies**, which are inaccessible to JavaScript. Combined with proper **CSRF protection**, this eliminates the primary XSS token-theft vector while preventing Cross-Site Request Forgery attacks.

### Why HttpOnly Cookies Are Safer

| Storage Method | XSS Risk | CSRF Risk |
|----------------|----------|-----------|
| **localStorage** | HIGH — JS can read | None |
| **HttpOnly Cookie** | NONE — JS cannot read | HIGH — requires CSRF protection |
| **HttpOnly Cookie + CSRF Token** | NONE | LOW (mitigated) |

### Why CSRF Protection Is Mandatory

When browsers automatically send cookies, malicious sites can forge requests on behalf of authenticated users. CSRF tokens — validated on every state-changing request — prevent this attack vector.

### Business Impact

- **Required before production launch** to meet security standards
- **No user-facing changes** — login/logout flows remain identical
- **Zero data migration** — only auth mechanism changes

---

## 2. Target Architecture

### Authentication Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                               │
└─────────────────────────────────────────────────────────────────┘

1. User submits credentials
   ↓
2. Backend validates credentials
   ↓
3. Backend generates:
   - Access Token (short-lived, e.g., 15 min)
   - Refresh Token (long-lived, e.g., 7 days)
   - CSRF Token (tied to session)
   ↓
4. Backend responds with:
   - Set-Cookie: access_token=... (HttpOnly, Secure, SameSite=Strict)
   - Set-Cookie: refresh_token=... (HttpOnly, Secure, SameSite=Strict, Path=/auth)
   - Body: { csrfToken: "...", user: {...} }
   ↓
5. Frontend stores CSRF token in memory (not localStorage)
   ↓
6. All subsequent requests include:
   - Cookies (automatic)
   - X-CSRF-Token header (manual)
```

### Token Responsibilities

| Token | Storage | Purpose | Lifetime |
|-------|---------|---------|----------|
| **Access Token** | HttpOnly Cookie | Authenticate API requests | 15 minutes |
| **Refresh Token** | HttpOnly Cookie (restricted path) | Obtain new access tokens | 7 days |
| **CSRF Token** | In-memory (JS variable) | Prevent forged requests | Session |

### Where Tokens Live

| Token | Browser Side | Server Side |
|-------|--------------|-------------|
| Access Token | Cookie (auto-sent) | Validated on every request |
| Refresh Token | Cookie (only sent to /auth/refresh) | Used to issue new access tokens |
| CSRF Token | Memory variable | Validated on state-changing requests |

---

## 3. Backend Design

### Login Response Behavior

Upon successful authentication, the backend will:

1. Generate a signed JWT access token (short-lived)
2. Generate a signed JWT refresh token (long-lived)
3. Generate a cryptographically random CSRF token
4. Associate CSRF token with the session/user in Redis or database
5. Set cookies in the response
6. Return CSRF token and user data in the response body

### Cookie Configuration

| Attribute | Access Token Cookie | Refresh Token Cookie |
|-----------|---------------------|----------------------|
| **Name** | `sini_access_token` | `sini_refresh_token` |
| **HttpOnly** | Yes | Yes |
| **Secure** | Yes (HTTPS only) | Yes |
| **SameSite** | Strict | Strict |
| **Path** | / | /api/v1/auth |
| **Max-Age** | 900 (15 min) | 604800 (7 days) |
| **Domain** | Production domain only | Production domain only |

### CSRF Token Generation Strategy

- Use `crypto.randomBytes(32).toString('hex')` for 256-bit entropy
- Return CSRF token to frontend via cookie AND response body
- CSRF token rotates on each login and refresh

### CSRF Strategy Options

#### A) Recommended (Phase 1): Double-Submit Cookie

This is the **recommended approach** for Phase 1 — simple, stateless, and requires no server-side storage.

**How it works**:

1. Server sets a **non-HttpOnly** cookie named `XSRF-TOKEN` containing the CSRF token
2. Frontend JavaScript reads this cookie value
3. Frontend sends the value in the `X-CSRF-Token` header on state-changing requests
4. Server compares cookie value with header value
5. If they match, request is valid (attacker cannot read our domain's cookies)

**Advantages**:

- No Redis or session store required
- Stateless — scales horizontally without session sync
- Simple implementation
- Industry standard (used by Angular, Axios defaults)

**Cookie Configuration for XSRF-TOKEN**:

| Attribute | Value |
|-----------|-------|
| **HttpOnly** | **No** (must be readable by JS) |
| **Secure** | Yes (HTTPS only in production) |
| **SameSite** | Strict |
| **Path** | / |

#### B) Optional (Future Enhancement): Server-Stored CSRF Tokens

For stronger security in high-risk applications, CSRF tokens can be stored server-side (Redis/DB) and validated against the stored value.

**When to consider**:

- If token binding to specific user sessions is required
- If token revocation on logout is critical
- If regulatory requirements demand server-side validation

**Note**: This is NOT required for Phase 1. Evaluate after initial cookie auth migration is complete.

### CSRF Validation Requirements

| Request Type | CSRF Required? |
|--------------|----------------|
| GET, HEAD, OPTIONS | No |
| POST, PUT, PATCH, DELETE | Yes |
| /auth/login | No (credentials establish session) |
| /auth/refresh | Yes |
| /auth/logout | Yes |

Validation process:

1. Extract `X-CSRF-Token` header from request
2. Extract `XSRF-TOKEN` cookie value
3. Compare header value with cookie value
4. Reject with 403 if missing or mismatched

### Logout Behavior

1. Accept POST request with CSRF token
2. Clear `sini_access_token` cookie (set Max-Age=0)
3. Clear `sini_refresh_token` cookie (set Max-Age=0)
4. Invalidate session server-side (remove CSRF association)
5. Return success response

### Token Refresh Flow

1. Client detects 401 on protected request
2. Client calls `/api/v1/auth/refresh` (refresh cookie auto-sent)
3. Backend validates refresh token
4. Backend issues new access token cookie
5. Backend issues new CSRF token
6. Client retries original request

### Required CORS Settings

```
Access-Control-Allow-Origin: [exact origin, not *]
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, X-CSRF-Token
Access-Control-Expose-Headers: X-CSRF-Token
```

**Critical**: `Access-Control-Allow-Origin` must be the exact frontend origin, not `*`, when `credentials: include` is used.

---

## 4. Frontend Design

### Changes to apiClient

The existing `apiClient.ts` will require modifications:

| Current Behavior | New Behavior |
|------------------|--------------|
| Read token from `localStorage` | No token reading needed |
| Set `Authorization: Bearer` header | Cookies sent automatically |
| No credential mode set | Add `credentials: 'include'` to all fetch calls |
| No CSRF header | Add `X-CSRF-Token` header to state-changing requests |

### CSRF Token Handling

- **Storage**: Hold CSRF token in a module-level variable (not localStorage)
- **Retrieval**: Extract from login/refresh response body
- **Header Name**: `X-CSRF-Token`
- **Persistence**: Lost on page refresh — re-authenticate or refresh on app init

### Which Requests Need CSRF Header

| Method | CSRF Header Required |
|--------|---------------------|
| GET | No |
| HEAD | No |
| OPTIONS | No |
| POST | Yes |
| PUT | Yes |
| PATCH | Yes |
| DELETE | Yes |

### Handling 401 / Expired Session

1. If 401 received and `features.enableSessionRefresh` is true:
   - Call refresh endpoint once
   - If refresh succeeds: retry original request
   - If refresh fails: redirect to login
2. If 401 received and refresh disabled:
   - Clear local state
   - Redirect to login page

### Integration with Existing Session Refresh Logic

The existing `sessionRefresh` scaffolding (M1-M3) will be adapted:
- `sessionRefresh()` will call `/api/v1/auth/refresh`
- No token returned in body — cookie is set automatically
- New CSRF token returned in body — frontend updates stored value

---

## 5. Migration Strategy

### Guiding Principles

- Zero downtime for users
- Existing sessions remain valid during migration
- Rollback capability at each phase

### Phase 1: Dual Support (Backend)

**Duration**: 1-2 weeks

Backend accepts BOTH authentication methods:
1. HttpOnly cookies (new)
2. Authorization header (existing)

Frontend continues using localStorage/headers.

**Validation**:
- Deploy backend
- Existing auth works unchanged
- New cookie endpoints available for testing

### Phase 2: Switch Primary Auth to Cookies (Frontend)

**Duration**: 1 week

1. Update login to expect Set-Cookie response
2. Update apiClient to use `credentials: 'include'`
3. Add CSRF token handling
4. Update logout to call cookie-clearing endpoint
5. Gate behind feature flag initially

**Validation**:
- Test new auth flow in dev
- Enable for internal users first
- Monitor for errors

### Phase 3: Remove localStorage Token (Cleanup)

**Duration**: 1 week

1. Remove localStorage token read/write
2. Remove Authorization header logic
3. Remove dual-support from backend
4. Update documentation

**Validation**:
- Full regression testing
- Security audit confirmation

### Rollback Plan

| Phase | Rollback Action |
|-------|-----------------|
| Phase 1 | Disable new cookie endpoints; no frontend impact |
| Phase 2 | Revert frontend to header-based auth; flag off |
| Phase 3 | Re-deploy Phase 2 code |

---

## 6. Security Checklist

### XSS Mitigation Impact

| Before | After |
|--------|-------|
| Token in localStorage — accessible to any JS | Token in HttpOnly cookie — invisible to JS |
| XSS = full token theft | XSS = cannot steal token |

**Residual Risk**: XSS can still make authenticated requests (using cookies) during the attack. Mitigate with CSP headers and input sanitization.

### CSRF Mitigation Impact

| Without CSRF Token | With CSRF Token |
|--------------------|-----------------|
| Attacker site can forge requests | Attacker cannot obtain valid CSRF token |
| Cookies auto-sent | CSRF header required for mutations |

### Replay Protection

- Short-lived access tokens (15 min) limit replay window
- Refresh tokens bound to user session server-side
- Token rotation on refresh provides additional protection

### SameSite Implications

| Setting | Cross-Site Behavior |
|---------|---------------------|
| `Strict` | Cookies NEVER sent cross-site |
| `Lax` | Cookies sent on top-level navigation |
| `None` | Cookies always sent (requires Secure) |

**Recommendation**: Use `SameSite=Strict` for maximum protection. Evaluate `Lax` if third-party integrations require it.

### Dev vs Production Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| Secure flag | Optional (HTTP localhost) | Required (HTTPS) |
| SameSite | Can be Lax for testing | Must be Strict |
| CORS origin | localhost:3000 | Exact production domain |
| Cookie domain | Not set (defaults to localhost) | Production domain |

---

## 7. Verification & Smoke Tests

### Verifying Cookies Are Set Correctly

1. **Login** with valid credentials
2. Open DevTools → Application → Cookies
3. Verify presence of:
   - `sini_access_token` (HttpOnly, Secure, SameSite)
   - `sini_refresh_token` (HttpOnly, Secure, SameSite, Path=/api/v1/auth)
4. Verify **no token in localStorage**
5. Verify CSRF token received in response body

### Verifying CSRF Protection Works

1. **Login** to obtain valid session
2. Attempt POST request **without** X-CSRF-Token header
3. Expect **403 Forbidden** response
4. Attempt POST request **with** correct X-CSRF-Token header
5. Expect success

### Testing Logout

1. **Login** and verify cookies present
2. **Logout** via POST to logout endpoint
3. Verify cookies **cleared** in DevTools
4. Attempt authenticated request
5. Expect **401 Unauthorized**

### Testing Refresh (If Enabled)

1. **Login** to establish session
2. Wait for access token to expire (or manually clear it)
3. Trigger any protected API call
4. Verify:
   - Refresh endpoint called automatically
   - New access token cookie set
   - Original request retried and succeeds
5. Verify **no infinite loops** in Network tab

---

## Assumptions Made

1. **No server store required for CSRF in Phase 1** — using Double-Submit Cookie pattern
2. **HTTPS in production** — Secure cookie flag requires this
3. **Single domain** — no cross-domain auth requirements
4. **Refresh token logic** is optional and gated by feature flag
5. **Existing session format** (user data structure) remains unchanged

---

## Open Questions Before Implementation

1. **Refresh token rotation**: Should refresh tokens be rotated on each use?
2. **Concurrent tabs**: How to handle CSRF token sync across multiple tabs?
3. **Mobile apps**: If native apps exist, they may need separate auth flow
4. **Third-party integrations**: Any existing integrations that expect Authorization headers?
5. **Session store (future)**: Redis vs database — only needed if migrating to server-stored CSRF tokens later

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CORS misconfiguration breaks auth | Medium | High | Test in staging first |
| Dual-support bugs during migration | Low | Medium | Feature flags + phased rollout |
| CSRF token lost on page refresh | Medium | Low | Implement app-init token refresh |
| Cookie size limits exceeded | Low | Low | Keep token payloads minimal |

---

## Document History

| Date | Author | Change |
|------|--------|--------|
| 2026-01-01 | Antigravity | Initial design document |
