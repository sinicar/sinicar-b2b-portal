# Permissions Center Architecture Map

## ملخص الهيكل

**ملف المصدر**: `src/components/UnifiedPermissionCenter.tsx`
**حجم الملف**: 2517 سطر
**عدد المكونات الداخلية**: 10 sub-components

---

## المكون الرئيسي: UnifiedPermissionCenter

**الموقع**: Lines 50-84
**Props**: لا يستقبل أي props
**State الخاص به**:

- `activeTab: TabType` (staff | customers | suppliers | overrides | organizations)
- `loading: boolean`

**المكونات المستوردة المستخدمة**:

- `PermissionHeader` ✅ مستخدم
- `PermissionTabs` ✅ مستخدم

---

## Sub-Components (المكونات الفرعية)

### 1. StaffPermissionsTab

**الموقع**: Lines 125-541 (416 سطر)
**Props**: لا يستقبل props (independent)
**State الخاص به**:

- `subTab: 'users' | 'roles'`
- `roles: StaffRole[]`
- `users: StaffUser[]`
- `loading, selectedRole, showAddModal, showEditModal, showAddUserModal`
- `formData, userFormData, editPermissions, searchQuery`

**Functions التي تغير البيانات**:
| Function | نوع التغيير | API Call? |
|----------|-------------|-----------|
| `saveRoles()` | localStorage | ❌ |
| `saveUsers()` | localStorage | ❌ |
| `handleAddRole()` | mutation | ❌ |
| `handleEditRole()` | mutation | ❌ |
| `handleDeleteRole()` | mutation | ❌ |
| `handleAddUser()` | mutation | ❌ |
| `handleDeleteUser()` | mutation | ❌ |
| `toggleUserStatus()` | mutation | ❌ |
| `togglePermission()` | local state | ❌ |

**عناصر UI القابلة للاستخراج**:

- Search bar (lines 298-306)
- Users table (lines 314-387)
- Roles grid (lines 403-433)
- Add User Modal (lines 437-499)
- Add/Edit Role Modal (lines 501-555)

---

### 2. CustomerPermissionsTab

**الموقع**: Lines 560-640 (80 سطر)
**Props**: لا يستقبل props
**State الخاص به**:

- `features: Record<string, boolean>`
- `loading, hasChanges`

**Functions التي تغير البيانات**:
| Function | نوع التغيير | API Call? |
|----------|-------------|-----------|
| `toggleFeature()` | local state | ❌ |
| `saveDefaults()` | localStorage | ❌ |

**عناصر UI القابلة للاستخراج**:

- Feature toggle cards (can use `FeatureToggleCard`)
- Save bar header (can use `SaveBar`)

---

### 3. SupplierPermissionsTab

**الموقع**: Lines 657-730 (73 سطر)
**Props**: لا يستقبل props
**State الخاص به**:

- `features: Record<string, boolean>`
- `loading, hasChanges`

**نفس هيكل CustomerPermissionsTab** - مرشح للدمج.

---

### 4. OverridesTab

**الموقع**: Lines 745-932 (187 سطر)
**Props**: لا يستقبل props
**State الخاص به**:

- `overrides: PermissionOverride[]`
- `loading, showAddModal, searchQuery`
- `selectedType, selectedUser, editOverrides`

**Functions التي تغير البيانات**:
| Function | نوع التغيير | API Call? |
|----------|-------------|-----------|
| `saveOverrides()` | localStorage | ❌ |
| `handleAddOverride()` | mutation | ❌ |
| `handleDeleteOverride()` | mutation | ❌ |

---

### 5. UsersTabContent (Legacy)

**الموقع**: Lines 936-1358 (422 سطر)
**ملاحظة**: "kept for backward compatibility"
**يستخدم API**: ❌ localStorage فقط

---

### 6. RolesTabContent

**الموقع**: Lines 1371-1719 (348 سطر)
**Props**: لا يستقبل props
**State الخاص به**:

- `roles: Role[]`, `groups: PermissionGroupRef[]`
- `loading, selectedRole, showPermissionModal`
- `permissionEdits, enabledResources, showAddModal, roleName`

**Functions التي تغير البيانات**:
| Function | نوع التغيير | API Call? |
|----------|-------------|-----------|
| `applyGroupToRole()` | mutation | ✅ Api.updateRole |
| `handleAddRole()` | mutation | ✅ Api.createRole |
| `handleSavePermissions()` | mutation | ✅ Api.updateRole |
| `handleDeleteRole()` | mutation | ✅ Api.deleteRole |
| `togglePermissionAction()` | local state | ❌ |

---

### 7. GroupsTabContent

**الموقع**: Lines 1734-2057 (323 سطر)
**Props**: لا يستقبل props
**State**: groups, loading, modals, form state

**Functions التي تغير البيانات**:

- `saveGroups()` → localStorage
- `handleAddGroup()`, `handleEditGroup()`, `handleDeleteGroup()`
- `togglePermission()`

---

### 8. VisibilityTabContent

**الموقع**: Lines 2092-2296 (204 سطر)
**State**: features, loading, hasChanges

**Functions التي تغير البيانات**:

- `saveFeatures()` → localStorage
- `toggleVisibility()`, `toggleAllForOwner()`, `resetToDefaults()`

---

### 9. OrganizationsTabContent

**الموقع**: Lines 2300-2514 (214 سطر)
**Props**: لا يستقبل props
**State**: organizations, selectedOrg, settings, loading, hasChanges

**Functions التي تغير البيانات**:
| Function | نوع التغيير | API Call? |
|----------|-------------|-----------|
| `handleSaveSettings()` | mutation | ✅ Api.updateOrganizationSettings |
| `updateSetting()` | local state | ❌ |

---

## خطة الاستخراج الآمنة (3 خطوات)

### الخطوة 1: استخراج المكونات البسيطة (Low Risk)

1. استبدال inline search bars بـ `PermissionSearchBar` في كل tab
2. استبدال feature toggle cards بـ `FeatureToggleCard`
3. استبدال section headers بـ `SectionHeader`

**الملفات المتأثرة**: فقط UnifiedPermissionCenter.tsx
**المخاطر**: منخفضة - UI فقط

### الخطوة 2: استخراج localStorage logic إلى hooks

1. نقل `saveRoles/saveUsers` من StaffPermissionsTab إلى hook
2. نقل `saveDefaults` من Customer/SupplierPermissionsTab إلى hook مشترك
3. إنشاء `useLocalPermissionStorage` hook

**الملفات المتأثرة**: UnifiedPermissionCenter.tsx + hooks جديدة
**المخاطر**: متوسطة - يجب اختبار persistence

### الخطوة 3: استخراج API mutations

1. نقل `handleSaveSettings` من OrganizationsTabContent
2. نقل `handleAddRole/handleSavePermissions/handleDeleteRole` من RolesTabContent
3. استخدام `usePermissionActions` hook الموجود

**الملفات المتأثرة**: UnifiedPermissionCenter.tsx + existing hooks
**المخاطر**: عالية - يجب اختبار API calls

---

## ملخص البيانات

| المصدر       | عدد المكونات                  | يستخدم API? |
| ------------ | ----------------------------- | ----------- |
| localStorage | 8 tabs                        | ❌          |
| API calls    | 2 tabs (Roles, Organizations) | ✅          |

---

## الـ Hooks الجاهزة للدمج

| Hook                   | الغرض             | مدمج؟   |
| ---------------------- | ----------------- | ------- |
| `usePermissionDerived` | filtering, counts | ❌ جاهز |
| `usePermissionActions` | CRUD, toggle      | ❌ جاهز |

---

## التوصيات

1. **أولوية عالية**: دمج `usePermissionDerived` في StaffPermissionsTab (أكبر tab)
2. **أولوية متوسطة**: دمج CustomerPermissionsTab و SupplierPermissionsTab (متشابهان)
3. **أولوية منخفضة**: استخراج legacy UsersTabContent (مكرر)
