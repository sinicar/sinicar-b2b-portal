# CSRF Smoke Test Results

> **Date**: 2026-01-01  
> **Commit**: Testing with Vite Proxy (C9.2)  
> **Status**: ⚠️ IN PROGRESS - Proxy Added, Needs Fresh Restart

---

## Configuration Changes Applied

### 1. Vite Proxy Added (`vite.config.ts`)

```typescript
server: {
  port: 3000,
  host: '0.0.0.0',
  proxy: {
    '/api': {
      target: 'http://localhost:3005',
      changeOrigin: true,
      secure: false,
    },
  },
},
```

### 2. API Base URL Updated (`src/services/apiClient.ts`)

```typescript
const API_BASE_URL: string = typeof envApiUrl === 'string' 
  ? envApiUrl 
  : (import.meta.env.DEV ? '/api/v1' : 'http://localhost:3005/api/v1');
```

---

## Test Environment

| Setting | Value |
| ------- | ----- |
| Backend Port | 3005 |
| Frontend Port | 3000 (target), 3001 (new instance) |
| Proxy Active | `/api` → `http://localhost:3005` |
| ENABLE_CSRF | true |
| ENABLE_CSRF_COOKIE | true |

---

## Test Results (Partial - Stale Server Issue)

| Test | Description | Status | Notes |
| ---- | ----------- | ------ | ----- |
| **A** | Cookie Issuance | ❌ FAIL | Cookie not in `document.cookie` |
| **B** | Header Sending | ❌ FAIL | No cookie = no header |
| **C** | Missing Header (403) | ✅ PASS | Backend rejects correctly |
| **D** | Missing Cookie (403) | ✅ PASS | Backend rejects correctly |
| **E** | Success Path | ❌ FAIL | Blocked by A |
| **F** | CORS Sanity | ✅ PASS | No CORS errors on proxy port |

---

## Current Blocker

**Old frontend on port 3000 using outdated code** (before proxy changes)

The new frontend instance started on port 3001 (because 3000 was in use).
The proxy IS working on port 3001, but the application code there still uses absolute URL.

---

## Required Action

1. **Kill all frontend processes** (ports 3000, 3001)
2. **Restart frontend** with new code:

   ```bash
   npx cross-env VITE_ENABLE_CSRF_HEADERS=true npm run dev
   ```

3. **Re-run tests A-F** on port 3000

---

## Evidence

### Proxy Works (port 3001)

```javascript
fetch('/api/v1/health')
// Returns: 404 "Path not found" from backend
// Proves proxy is forwarding requests correctly
```

### CSRF Middleware Works

```json
{
  "error": "CSRF validation failed",
  "code": "CSRF_INVALID",
  "reason": "missing_cookie"
}
```

---

## Test Credentials

| User | Role | Password |
| ---- | ---- | -------- |
| user-1 | ادمن (Admin) | 1 |
| user-2 | عميل (Customer) | 1 |
| user-3 | مورد (Supplier) | 1 |
