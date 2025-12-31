# SINI CAR B2B - Maintainability Rules

> Generated: 2025-12-31 | How to Change Code Safely

---

## 1. Files You Should NEVER Edit Directly (ملفات لا تعدّل مباشرة)

### 🚫 CRITICAL - DO NOT EDIT

| File                   | Reason                          | Instead                                |
| ---------------------- | ------------------------------- | -------------------------------------- |
| `src/services/api.ts`  | Facade layer, many dependencies | Add to apiClient.ts or modules/        |
| `prisma/schema.prisma` | Database schema                 | Create migration, coordinate with team |
| `backend/.env`         | Secrets                         | Use .env.example as template           |
| `src/types.ts` (main)  | 131KB, shared types             | Add to src/types/\*.ts                 |

### ⚠️ CAUTION - Edit Carefully

| File                                | Size  | Risk   | Notes                    |
| ----------------------------------- | ----- | ------ | ------------------------ |
| `src/App.tsx`                       | 38KB  | HIGH   | Main routing, auth logic |
| `src/components/Dashboard.tsx`      | 112KB | HIGH   | Customer portal          |
| `src/components/SupplierPortal.tsx` | 90KB  | HIGH   | Supplier portal          |
| `src/components/AdminDashboard.tsx` | 75KB  | HIGH   | Admin portal             |
| `src/services/apiClient.ts`         | 35KB  | MEDIUM | All API calls            |

---

## 2. Safe Modification Pattern (نمط التعديل الآمن)

### The "Extract → Build → Commit → Wire → Build → Commit" Pattern

```
Step 1: EXTRACT
        ↓
  Create new file with extracted code
  (Don't change original yet)
        ↓
Step 2: BUILD
        ↓
  npm run typecheck
  npm run build
        ↓
Step 3: COMMIT
        ↓
  git commit -m "feat: extract MyComponent"
        ↓
Step 4: WIRE
        ↓
  Update original to import and use new file
        ↓
Step 5: BUILD
        ↓
  npm run typecheck
  npm run build
        ↓
Step 6: COMMIT
        ↓
  git commit -m "refactor: use extracted MyComponent"
        ↓
Step 7: DELETE (optional)
        ↓
  Remove inline code from original
```

### Example: Extracting a Component

```typescript
// Before: Dashboard.tsx has 3000 lines including OrdersTable

// Step 1: Create src/features/orders/components/OrdersTable.tsx
export const OrdersTable = (props) => {
  /* extracted code */
};

// Step 2 & 3: Build and commit

// Step 4: Update Dashboard.tsx
import { OrdersTable } from "../features/orders/components/OrdersTable";
// Use <OrdersTable /> instead of inline JSX

// Step 5 & 6: Build and commit

// Step 7: Delete inline code from Dashboard.tsx
```

---

## 3. Where to Put Things (أين تضع الأشياء)

### Components

```
src/components/           # Shared/global components
src/features/*/components/  # Feature-specific components
```

### Hooks

```
src/hooks/                # Global hooks
src/shared/hooks/         # Shared utility hooks
src/features/*/hooks/     # Feature-specific hooks
```

### Types

```
src/types.ts              # Legacy (avoid adding here)
src/types/*.ts            # Prefer modular type files
src/features/*/types.ts   # Feature-specific types
```

### API Functions

```
src/services/apiClient.ts        # Main HTTP client
src/services/api/modules/*.ts    # Modular API functions
```

### Utilities

```
src/utils/                # Global utilities
src/shared/utils/         # Shared helpers
```

---

## 4. Naming Conventions (اصطلاحات التسمية)

### Files

| Type      | Convention           | Example              |
| --------- | -------------------- | -------------------- |
| Component | PascalCase           | `OrdersTable.tsx`    |
| Hook      | camelCase with "use" | `useOrderFilters.ts` |
| Utility   | camelCase            | `formatCurrency.ts`  |
| Type file | camelCase            | `orderTypes.ts`      |
| Service   | camelCase            | `orderService.ts`    |

### Variables & Functions

```typescript
// Variables
const orderCount = 10; // camelCase
const ITEMS_PER_PAGE = 20; // SCREAMING_SNAKE for constants

// Functions
function calculateTotal() {} // camelCase
const handleSubmit = () => {}; // camelCase with "handle" for events

// Components
const OrdersTable = () => {}; // PascalCase

// Types
interface OrderItem {} // PascalCase
type OrderStatus = "NEW" | "PENDING"; // PascalCase
```

### API Endpoints

```
GET    /orders              # List (plural)
GET    /orders/:id          # Details
POST   /orders              # Create
PUT    /orders/:id          # Full update
PATCH  /orders/:id/status   # Partial update
DELETE /orders/:id          # Delete
```

---

## 5. Pre-Merge Checklist (قائمة ما قبل الدمج)

### ✅ Required Before Every PR

```bash
# 1. Type check - MUST PASS
npm run typecheck

# 2. Build - MUST PASS
npm run build

# 3. Manual smoke test - MUST WORK
# - Login as admin, customer, supplier
# - Navigate to modified pages
# - Test main functionality
```

### ✅ Code Review Checklist

- [ ] No `// @ts-ignore` without explanation
- [ ] No `any` types without justification
- [ ] Error handling for API calls (try/catch)
- [ ] Loading states for async operations
- [ ] Arabic translations added
- [ ] Console logs removed (or behind DEV flag)
- [ ] No hardcoded URLs/secrets

---

## 6. Error Handling Patterns (أنماط معالجة الأخطاء)

### API Calls

```typescript
// ✅ Good
try {
  const data = await ApiClient.orders.getById(id);
  setOrder(data);
} catch (error) {
  console.error("Failed to load order:", error);
  toast.error(t("errors.loadFailed"));
}

// ❌ Bad
const data = await ApiClient.orders.getById(id); // No error handling!
```

### Null Safety

```typescript
// ✅ Good
const total = order?.totalAmount ?? 0;
const name = user?.profile?.companyName || "Unknown";

// ❌ Bad
const total = order.totalAmount; // Might crash!
```

---

## 7. Performance Rules (قواعد الأداء)

### React Optimization

```typescript
// ✅ Use memo for expensive components
const ExpensiveTable = memo(({ data }) => { ... });

// ✅ Use useCallback for event handlers passed to children
const handleClick = useCallback(() => { ... }, [deps]);

// ✅ Use useMemo for expensive calculations
const filteredData = useMemo(() => data.filter(...), [data, filter]);
```

### API Calls

```typescript
// ✅ Debounce search inputs
const debouncedSearch = useMemo(() => debounce(searchFn, 300), []);

// ✅ Avoid fetching in render
useEffect(() => {
  fetchData();
}, [dependencies]); // Not inside render
```

---

## 8. Testing Commands (أوامر الاختبار)

```bash
# Type checking
npm run typecheck

# Build (includes type check)
npm run build

# Development server
npm run dev

# Backend
cd backend && npm run dev
```

---

## 9. Common Mistakes to Avoid (أخطاء شائعة)

| Mistake                 | Consequence               | Prevention             |
| ----------------------- | ------------------------- | ---------------------- |
| Editing api.ts directly | Break multiple components | Use modules/           |
| No error handling       | White screen on errors    | Always try/catch       |
| Missing translations    | Missing text in Arabic    | Add to locales/\*.json |
| Hardcoded strings       | Can't translate           | Use t('key')           |
| No loading states       | UI feels broken           | Show spinner           |
| Large PRs               | Hard to review            | Small, focused changes |

---

## 10. Git Commit Messages

### Format

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type       | Usage                               |
| ---------- | ----------------------------------- |
| `feat`     | New feature                         |
| `fix`      | Bug fix                             |
| `refactor` | Code change without behavior change |
| `docs`     | Documentation only                  |
| `style`    | Formatting, no code change          |
| `chore`    | Build, config changes               |

### Examples

```bash
git commit -m "feat(orders): add export to Excel button"
git commit -m "fix(supplier): resolve 403 on products endpoint"
git commit -m "refactor(dashboard): extract OrdersTable component"
git commit -m "docs: update API contracts documentation"
```

---

## Next Steps

- See [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) for project structure
- See [API_CONTRACTS_MAP.md](./API_CONTRACTS_MAP.md) for API reference
