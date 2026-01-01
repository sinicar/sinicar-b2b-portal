# Session Refresh Plan (Incremental)

## Goal
Add access-token refresh without breaking existing API contracts or user flows.

## Steps
- M1: Add scaffolding files (no wiring).
- M2: Wire behind a feature flag (disabled by default).
- M3: Enable in dev environment first, add smoke tests.

## Rules
- No behavior change unless the flag is enabled.
- Always run: npm run verify.

---

## How to Enable in Dev

Add to your `.env.local`:

```env
VITE_ENABLE_SESSION_REFRESH=true
```

Then restart the dev server:

```bash
npm run dev
```

---

## Smoke Test Checklist

1. **Login** normally
2. **Invalidate token**: In DevTools → Application → Local Storage → edit `auth_token` to an invalid value
3. **Trigger any API call** (e.g., navigate to a new page)
4. **Expected behavior**:
   - If refresh endpoint IS available: one refresh attempt, then retry the original request
   - If refresh endpoint NOT available: falls back to 401 error (no infinite loop)
5. **Verify no infinite loops** in Network tab

---

## Production Safety

- **Default**: OFF (env variable not set = disabled)
- Only enable after backend `/auth/refresh` endpoint is fully tested

