# SINI CAR B2B - Permissions Center Deep Dive

> Generated: 2025-12-31 | Admin Permission Management System

---

## 1. Overview (نظرة عامة)

**Permissions Center** is the admin interface for managing user roles, permissions, and access control across the platform.

### Main File

```
src/components/UnifiedPermissionCenter.tsx (146KB)
```

### Related Files

| File                                     | Purpose                       |
| ---------------------------------------- | ----------------------------- |
| `src/services/PermissionContext.tsx`     | React context for permissions |
| `backend/src/modules/permissions/`       | Backend permission logic      |
| `backend/src/modules/permission-center/` | Admin API endpoints           |

---

## 2. Permission Center Tabs (التبويبات)

| Tab | Name                  | Data Source     | Description                 |
| --- | --------------------- | --------------- | --------------------------- |
| 1   | **Roles Management**  | API             | CRUD for system roles       |
| 2   | **Permissions List**  | API             | View all permissions        |
| 3   | **Role Permissions**  | API             | Assign permissions to roles |
| 4   | **User Roles**        | API             | Assign roles to users       |
| 5   | **Permission Groups** | API             | Bundle permissions          |
| 6   | **User Overrides**    | API             | Custom user permissions     |
| 7   | **Supplier Roles**    | API             | Supplier-specific roles     |
| 8   | **Feature Access**    | localStorage ⚠️ | Feature visibility (legacy) |
| 9   | **Audit Log**         | API             | Permission change history   |

---

## 3. Data Flow Architecture

### API-Based Tabs (1-7, 9)

```
┌────────────────┐     API Request      ┌────────────────┐
│  Permission    │ ───────────────────▶│    Backend     │
│    Center      │                      │   /permissions │
└────────────────┘                      └────────────────┘
        │                                       │
        │◀──────── JSON Response ───────────────┘
        │
        ▼
┌────────────────────────────────────────────────┐
│  React State → Render Table → User Actions     │
└────────────────────────────────────────────────┘
```

### localStorage-Based Tab (8 - Feature Access)

```
┌────────────────┐      Read/Write       ┌────────────────┐
│  Feature       │ ◀───────────────────▶│  localStorage  │
│  Access Tab    │                       │ (client only)  │
└────────────────┘                       └────────────────┘
        │
        ▼
⚠️ NOT synced with backend - affects current browser only
```

---

## 4. API Endpoints Used

| Operation                 | Endpoint                        | Method |
| ------------------------- | ------------------------------- | ------ |
| Get all roles             | `/permissions/roles`            | GET    |
| Create role               | `/permissions/roles`            | POST   |
| Update role               | `/permissions/roles/:id`        | PUT    |
| Delete role               | `/permissions/roles/:id`        | DELETE |
| Get permissions           | `/permissions`                  | GET    |
| Assign permission to role | `/permissions/assign-role`      | POST   |
| Revoke permission         | `/permissions/revoke-role`      | POST   |
| Get user assignments      | `/permissions/user-assignments` | GET    |
| Get audit log             | `/permissions/audit-log`        | GET    |

---

## 5. Save/Load Behavior

### Roles & Permissions (API)

```typescript
// Save
const handleSaveRole = async (role) => {
  await ApiClient.permissions.updateRole(role.id, role);
  toast.success("تم الحفظ");
  reload();
};

// Load
useEffect(() => {
  ApiClient.permissions.getRoles().then(setRoles);
}, []);
```

### Feature Access (localStorage)

```typescript
// Save
const handleSaveFeature = (feature) => {
  const features = JSON.parse(localStorage.getItem("feature_flags") || "{}");
  features[feature.key] = feature.enabled;
  localStorage.setItem("feature_flags", JSON.stringify(features));
};

// Load
const features = JSON.parse(localStorage.getItem("feature_flags") || "{}");
```

---

## 6. Regression Checklist (قائمة التحقق)

Before making changes to Permission Center:

- [ ] **Tab Navigation**: All 9 tabs load without errors
- [ ] **Role CRUD**: Create, edit, delete roles
- [ ] **Permission Assignment**: Assign/revoke permissions from roles
- [ ] **User Role Assignment**: Assign roles to users
- [ ] **Save Persistence**: Changes persist after page refresh
- [ ] **API Errors**: Proper error handling and messages
- [ ] **Loading States**: Show spinners during API calls
- [ ] **Empty States**: Proper messages when no data
- [ ] **Search/Filter**: Filter functionality works
- [ ] **Pagination**: Works if many items

### Quick Test Commands

```bash
# 1. Login as admin
# 2. Navigate to /admin/permissions
# 3. Test each tab
# 4. Make a change and verify it persists
```

---

## 7. localStorage to API Migration Plan (خطة التحويل)

### Current State (Tab 8 - Feature Access)

```javascript
// Data stored in localStorage
localStorage.setItem('feature_flags', JSON.stringify({
  'show_pricing': true,
  'enable_ai': false,
  ...
}));
```

### Migration Steps (مستقبلاً - بدون تنفيذ)

#### Phase 1: Backend Preparation

1. Create `FeatureFlag` model in Prisma schema
2. Add CRUD endpoints: `/settings/features/flags`
3. Add migration script for existing data

#### Phase 2: Frontend Update

1. Replace localStorage calls with API calls
2. Add loading states
3. Handle offline/error cases

#### Phase 3: Data Migration

1. Read localStorage on first load
2. Push to backend
3. Clear localStorage after successful sync

#### Phase 4: Cleanup

1. Remove localStorage fallback code
2. Update documentation
3. Test thoroughly

### Estimated Effort

- Backend: 4-6 hours
- Frontend: 2-3 hours
- Testing: 2-3 hours

---

## 8. Key Code Sections

### Role Management

```typescript
// Line ~200-400 in UnifiedPermissionCenter.tsx
const RolesTab = () => {
  // CRUD operations for roles
};
```

### Permission Assignment

```typescript
// Line ~500-700
const RolePermissionsTab = () => {
  // Matrix view of role-permission assignments
};
```

### User Role Assignment

```typescript
// Line ~800-1000
const UserRolesTab = () => {
  // Assign roles to specific users
};
```

---

## 9. Common Issues & Solutions

| Issue                     | Cause             | Solution                          |
| ------------------------- | ----------------- | --------------------------------- |
| Permissions not applying  | Cache             | Clear localStorage, refresh       |
| Role changes not saved    | API error         | Check network tab, backend logs   |
| Feature flags local only  | By design         | Use API tabs for real persistence |
| 403 on permission changes | Insufficient role | Need SUPER_ADMIN role             |

---

## Next Steps

- See [AUTH_AND_ROLES.md](./AUTH_AND_ROLES.md) for RBAC architecture
- See [MAINTAINABILITY_RULES.md](./MAINTAINABILITY_RULES.md) for editing guidelines
