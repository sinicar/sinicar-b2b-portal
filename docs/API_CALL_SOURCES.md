# API Call Sources Audit - SINI CAR B2B

> Generated: 2025-12-31 | READ-ONLY AUDIT

---

## 1. API Layer Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       FRONTEND                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Components (*.tsx)                                           │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  api.ts (336 lines) - FACADE LAYER                      │  │
│   │  ⚠️ DO NOT EDIT - Delegates to modules                  │  │
│   └─────────────────────────────────────────────────────────┘  │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  api/modules/*.ts (18 modules)                          │  │
│   │  auth, orders, customers, suppliers, etc.               │  │
│   └─────────────────────────────────────────────────────────┘  │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  apiClient.ts (1055 lines)                              │  │
│   │  Main HTTP client - get(), post(), put(), del()         │  │
│   └─────────────────────────────────────────────────────────┘  │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  http.ts (26 lines) - Bridge/Re-exports                 │  │
│   │  Also: httpClient.ts (low-level with retry)             │  │
│   └─────────────────────────────────────────────────────────┘  │
│        │                                                        │
│        ▼                                                        │
│   fetch() → Backend API                                        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. API Modules (src/services/api/modules/)

| Module         | File              | Functions                               | Endpoints Used     |
| -------------- | ----------------- | --------------------------------------- | ------------------ |
| auth           | auth.ts           | login, logout, register, getCurrentUser | `/auth/*`          |
| orders         | orders.ts         | getAll, getById, create, updateStatus   | `/orders/*`        |
| quotes         | quotes.ts         | getAll, create, updateStatus            | `/orders/quotes/*` |
| customers      | customers.ts      | getAll, getById, update, delete         | `/customers/*`     |
| suppliers      | suppliers.ts      | getAll, getById, getProducts            | `/suppliers/*`     |
| products       | products.ts       | search, getById, getAlternatives        | `/products/*`      |
| settings       | settings.ts       | getAll, update, getFeatureFlags         | `/settings/*`      |
| notifications  | notifications.ts  | getAll, markAsRead, getUnreadCount      | `/notifications/*` |
| installments   | installments.ts   | getRequests, createRequest, adminReview | `/installments/*`  |
| activity       | activity.ts       | getLogs, record                         | `/activity/*`      |
| adminUsers     | adminUsers.ts     | getAll, create, update, delete          | `/admin/users/*`   |
| userManagement | userManagement.ts | getUsers, updateUser                    | `/users/*`         |
| ai             | ai.ts             | (stub)                                  | `/ai/*`            |
| images         | images.ts         | (stub)                                  | `/images/*`        |
| currency       | currency.ts       | getAll, update                          | `/currencies/*`    |
| reports        | reports.ts        | generate, getById                       | `/reports/*`       |
| dashboard      | dashboard.ts      | getStats                                | `/dashboard/*`     |
| index          | index.ts          | Re-exports all                          | -                  |

---

## 3. Direct fetch() Calls Outside API Layer

### ✅ Authorized External API Calls

| File              | Line | Target                                            | Purpose              |
| ----------------- | ---- | ------------------------------------------------- | -------------------- |
| `aiSeoService.ts` | 262  | `https://api.openai.com/v1/chat/completions`      | OpenAI integration   |
| `otpService.ts`   | 92   | `https://el.cloud.unifonic.com/rest/SMS/messages` | SMS OTP via Unifonic |

### ⚠️ Internal fetch() in apiClient.ts

| Location           | Purpose                | Status          |
| ------------------ | ---------------------- | --------------- |
| `apiClient.ts:43`  | Main API request       | ✅ Centralized  |
| `apiClient.ts:422` | File upload (FormData) | ✅ Special case |

### ❌ Unauthorized Direct Fetch Calls

**None found** - All internal API calls go through `apiClient.ts`

---

## 4. localStorage Usage Analysis

### Files Using localStorage (34 files found)

#### Services Layer

| File                          | Keys Used           | Purpose             |
| ----------------------------- | ------------------- | ------------------- |
| `apiClient.ts`                | `auth_token`        | JWT storage         |
| `httpClient.ts`               | `auth_token`        | JWT retrieval       |
| `api.ts`                      | `auth_token`        | Auth check          |
| `featureVisibilityService.ts` | Feature flags       | Feature toggles     |
| `staffAuthService.ts`         | Session data        | Staff auth          |
| `i18n.ts`                     | `preferredLanguage` | Language preference |
| `serviceFactory.ts`           | Various             | Service config      |
| `seoService.ts`               | SEO settings        | Cached SEO data     |
| `aiSeoService.ts`             | API keys            | OpenAI key storage  |
| `otpService.ts`               | OTP state           | Verification state  |
| `supabaseClient.ts`           | Supabase session    | Auth state          |
| `realApi.ts`                  | Session             | Auth state          |

#### Components Layer

| Component                     | Keys Used               | Purpose        | Risk   |
| ----------------------------- | ----------------------- | -------------- | ------ |
| `App.tsx`                     | `auth_token`, user data | Main auth      | LOW    |
| `Dashboard.tsx`               | View preferences        | UI state       | LOW    |
| `SupplierPortal.tsx`          | View state              | UI state       | LOW    |
| `UnifiedPermissionCenter.tsx` | Feature flags           | ⚠️ Permissions | MEDIUM |
| `AdminDashboard.tsx`          | Admin preferences       | UI state       | LOW    |
| `AdminAITrainingPage.tsx`     | AI config               | Settings       | LOW    |
| `AdminReportsCenterPage.tsx`  | Report config           | Settings       | LOW    |
| `ProductSearchPage.tsx`       | Search history          | UX             | LOW    |

---

## 5. API Consistency Check

### ✅ Consistent Patterns

- All modules use `get()`, `post()`, `put()`, `del()` from apiClient
- JWT token attached automatically via `apiRequest()` helper
- Error handling follows same pattern
- Response parsing is unified

### ⚠️ Inconsistencies Found

| Issue                                        | Location                 | Severity               |
| -------------------------------------------- | ------------------------ | ---------------------- |
| Some modules import from httpClient directly | Various                  | LOW                    |
| FormData uploads bypass JSON serialization   | apiClient.ts:422         | OK (by design)         |
| External API calls bypass auth layer         | aiSeoService, otpService | OK (different service) |

---

## 6. Token Flow Audit

```
Login Flow:
1. POST /auth/login → receive { accessToken, refreshToken }
2. localStorage.setItem('auth_token', accessToken)
3. All subsequent requests: Authorization: Bearer <token>

Token Check Locations:
- apiClient.ts:11 → getAuthToken()
- apiClient.ts:32-34 → Attach to request headers
- httpClient.ts → Also reads token

⚠️ Finding: Token is stored in localStorage (vulnerable to XSS)
   Recommendation: Consider HttpOnly cookies for production
```

---

## 7. Summary

| Aspect                | Status      | Details                    |
| --------------------- | ----------- | -------------------------- |
| Centralized API Layer | ✅          | apiClient.ts is main entry |
| Module Organization   | ✅          | 18 modules in api/modules/ |
| External Calls        | ✅ 2 only   | OpenAI, Unifonic           |
| Unauthorized fetch()  | ✅ None     | All go through apiClient   |
| localStorage Usage    | ⚠️ 34 files | Mostly UI state, some auth |
| Token Security        | ⚠️          | localStorage (XSS risk)    |

---

_Next: See [LARGEST_FILES_REPORT.md](./LARGEST_FILES_REPORT.md) for maintainability audit_
