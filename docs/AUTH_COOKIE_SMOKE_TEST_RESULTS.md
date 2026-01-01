# Auth Cookie Smoke Test Results

## A) Setup (Dev)

### Backend

```bash
cd backend
npx cross-env \
  ENABLE_AUTH_COOKIE=true \
  ENABLE_CSRF_COOKIE=true \
  ENABLE_CSRF=true \
  CORS_ORIGIN=http://localhost:3000 \
  npm run dev
```

### Frontend

```bash
npx cross-env \
  VITE_ENABLE_AUTH_COOKIE_MODE=true \
  VITE_ENABLE_API_CREDENTIALS=true \
  VITE_ENABLE_CSRF_HEADERS=true \
  npm run dev -- --port 3000
```

---

## B) Test Results

### Default Mode (Flags OFF)

| Test | Description | Status | Evidence |
|------|-------------|--------|----------|
| T1 | Login stores `auth_token` in localStorage | ⬜ PENDING | DevTools → Application → Local Storage |
| T2 | API requests send Authorization header | ⬜ PENDING | Network tab → Request headers |
| T3 | Logout clears `auth_token` + `b2b_session_sini_v2` | ⬜ PENDING | localStorage empty after logout |
| T4 | Refresh page keeps user logged out | ⬜ PENDING | User remains on login page |

### Cookie Mode (Flags ON)

| Test | Description | Status | Evidence |
|------|-------------|--------|----------|
| T5 | Login issues `AUTH_TOKEN` cookie (HttpOnly), no localStorage token | ⬜ PENDING | Cookies tab shows `AUTH_TOKEN`, localStorage empty |
| T6 | API requests succeed via cookie bridge | ⬜ PENDING | 200 responses, credentials: include |
| T7 | Logout clears `AUTH_TOKEN` cookie | ⬜ PENDING | Cookie removed from Application → Cookies |
| T8 | Refresh page keeps user logged out | ⬜ PENDING | User remains on login page |

### Negative Tests (Cookie Mode)

| Test | Description | Status | Evidence |
|------|-------------|--------|----------|
| T9 | Delete XSRF cookie → POST fails 403 | ⬜ PENDING | Response: CSRF token validation failed |
| T10 | Admin views still load (Dashboard/Settings/Products) | ⬜ PENDING | No 401/403 errors |

---

## C) Safety Notes

### Production Defaults

- `ENABLE_AUTH_COOKIE=false` (backend)
- `VITE_ENABLE_AUTH_COOKIE_MODE=false` (frontend)

### Rollback Steps

1. Set all flags to `false`
2. Clear browser cookies and localStorage
3. Restart backend and frontend
4. Verify login uses localStorage token

---

## Go/No-Go Checklist

Before enabling cookie mode broadly:

- [ ] T5 PASS - Cookie issued, no localStorage
- [ ] T6 PASS - API requests work
- [ ] T7 PASS - Logout clears cookie
- [ ] T8 PASS - Session terminates properly
- [ ] T10 PASS - No regressions in admin views

---

## Related Docs

- [Auth Cookie Migration Plan](./AUTH_COOKIE_MIGRATION.md)
- [CSRF Cookie Auth Design](./CSRF_COOKIE_AUTH_DESIGN.md)
