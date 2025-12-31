# SINI CAR B2B - Authentication & Roles

> Generated: 2025-12-31 | Security & Access Control Documentation

---

## 1. Authentication Flow (تدفق المصادقة)

### Login Flow

```
┌─────────────┐    POST /auth/login     ┌─────────────┐
│   Frontend  │ ───────────────────────▶│   Backend   │
│             │ { identifier, password } │             │
└─────────────┘                          └─────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │ Validate Credentials  │
                                    │ Generate JWT Token    │
                                    └───────────────────────┘
                                                │
       ◀────────────────────────────────────────┘
       { user, accessToken, refreshToken }
                │
                ▼
┌───────────────────────────────────────┐
│ localStorage.setItem('auth_token',    │
│                       accessToken)    │
│ Store user in React Context/State     │
└───────────────────────────────────────┘
```

### Logout Flow

```
┌─────────────┐    POST /auth/logout    ┌─────────────┐
│   Frontend  │ ───────────────────────▶│   Backend   │
└─────────────┘                          └─────────────┘
                                                │
       ◀────────────────────────────────────────┘
       { success: true }
                │
                ▼
┌───────────────────────────────────────┐
│ localStorage.removeItem('auth_token') │
│ Clear user state                       │
│ Redirect to login                      │
└───────────────────────────────────────┘
```

---

## 2. Token Storage (تخزين التوكن)

### Storage Keys

```javascript
// Main auth token
localStorage.getItem("auth_token");

// User data (cached)
localStorage.getItem("sinicar_user");

// Session preferences
localStorage.getItem("preferredLanguage");
localStorage.getItem("preferredCurrency");
```

### Token Structure (JWT)

```javascript
{
  "sub": "user-uuid",
  "clientId": "SC-00001",
  "role": "CUSTOMER_OWNER",
  "email": "user@example.com",
  "iat": 1703980800,
  "exp": 1704067200  // 24 hours
}
```

### Token Refresh

- Token expiry: 24 hours
- Refresh token: 7 days
- Auto-refresh: Not currently implemented (TODO)

---

## 3. User Types (أنواع المستخدمين)

### Role Hierarchy

| Role                 | Code               | Portal Access   | Description             |
| -------------------- | ------------------ | --------------- | ----------------------- |
| **Super Admin**      | `SUPER_ADMIN`      | Admin Portal    | Full system access      |
| **Admin**            | `ADMIN`            | Admin Portal    | Management access       |
| **Employee**         | `EMPLOYEE`         | Admin Portal    | Limited admin access    |
| **Customer Owner**   | `CUSTOMER_OWNER`   | Customer Portal | Business owner          |
| **Customer Staff**   | `CUSTOMER_STAFF`   | Customer Portal | Employee of customer    |
| **Supplier Owner**   | `SUPPLIER_OWNER`   | Supplier Portal | Supplier business owner |
| **Supplier Manager** | `SUPPLIER_MANAGER` | Supplier Portal | Supplier manager        |
| **Supplier Staff**   | `SUPPLIER_STAFF`   | Supplier Portal | Supplier employee       |

### User Status Flow

```
PENDING → ACTIVE → SUSPENDED
    ↘ REJECTED
```

---

## 4. RBAC System (نظام الصلاحيات)

### Permission Structure

```
Role
 └── RolePermission (canCreate, canRead, canUpdate, canDelete)
      └── Permission (code, module, category)
           └── User (via UserRoleAssignment)
```

### Permission Categories

| Module      | Permissions                                            |
| ----------- | ------------------------------------------------------ |
| `ORDERS`    | orders.view, orders.create, orders.edit, orders.delete |
| `QUOTES`    | quotes.view, quotes.create, quotes.respond             |
| `CUSTOMERS` | customers.view, customers.create, customers.edit       |
| `SUPPLIERS` | suppliers.view, suppliers.manage                       |
| `PRODUCTS`  | products.view, products.create, products.edit          |
| `SETTINGS`  | settings.view, settings.edit                           |
| `REPORTS`   | reports.view, reports.export                           |

### Permission Check Flow

```javascript
// Frontend
const hasPermission = (permissionCode) => {
  const user = getCurrentUser();
  return user.permissions?.includes(permissionCode);
};

// Backend (middleware)
const requirePermission = (permissionCode) => {
  return async (req, res, next) => {
    const user = req.user;
    const hasAccess = await permissionService.check(user.id, permissionCode);
    if (!hasAccess) return res.status(403).json({ message: "Access denied" });
    next();
  };
};
```

---

## 5. Frontend Auth Implementation

### Auth Middleware (App.tsx)

```typescript
// Simplified auth check in App.tsx
useEffect(() => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    // Validate token with backend
    ApiClient.auth
      .getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => {
        localStorage.removeItem("auth_token");
        setCurrentUser(null);
      });
  }
}, []);
```

### Protected Routes

```typescript
// Route protection in App.tsx
{
  isAuthenticated ? (
    <Dashboard user={currentUser} />
  ) : (
    <UnifiedLoginPage onLogin={handleLogin} />
  );
}
```

---

## 6. Backend Auth Middleware

### Location

`backend/src/middleware/auth.middleware.ts`

### Implementation

```typescript
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
```

---

## 7. Security Best Practices (ممارسات الأمان)

### ✅ Current Implementations

- JWT tokens with expiration
- Password hashing (bcrypt)
- Role-based access control
- Token stored in localStorage (client-side)
- HTTPS in production

### ⚠️ Security Considerations

| Risk          | Mitigation                     | Status                |
| ------------- | ------------------------------ | --------------------- |
| XSS Attack    | Sanitize inputs, CSP headers   | ✅ Partial            |
| CSRF Attack   | Use SameSite cookies           | ⚠️ TODO               |
| Token theft   | HttpOnly cookies (recommended) | ⚠️ Using localStorage |
| Brute force   | Rate limiting                  | ✅ Backend            |
| Data exposure | Field-level permissions        | ⚠️ Partial            |

### 🔒 Recommendations

1. **Move tokens to HttpOnly cookies** for production
2. Implement **refresh token rotation**
3. Add **IP-based session validation**
4. Enable **2FA for admin accounts**
5. Log all authentication events

---

## 8. Session Storage Keys Summary

| Key                   | Purpose             | Cleared on Logout |
| --------------------- | ------------------- | ----------------- |
| `auth_token`          | JWT access token    | ✅ Yes            |
| `sinicar_user`        | Cached user data    | ✅ Yes            |
| `preferredLanguage`   | UI language         | ❌ No             |
| `preferredCurrency`   | Currency preference | ❌ No             |
| `admin_permissions_*` | Cached permissions  | ✅ Yes            |

---

## 9. Common Auth Errors

| Error Code | Message        | Solution                                     |
| ---------- | -------------- | -------------------------------------------- |
| 401        | Unauthorized   | Token missing or expired - redirect to login |
| 403        | Forbidden      | User lacks permission - show access denied   |
| 423        | Account Locked | Too many failed attempts - contact admin     |

---

## Next Steps

- See [PERMISSIONS_CENTER_DEEP_DIVE.md](./PERMISSIONS_CENTER_DEEP_DIVE.md) for permission management UI
- See [BUSINESS_FLOWS.md](./BUSINESS_FLOWS.md) for role-specific workflows
