# وثيقة التصميم - تحسينات مشروع صيني كار

## نظرة عامة

هذه الوثيقة تحدد التصميم التفصيلي لتحسينات مشروع صيني كار B2B Portal بناءً على التحليل الشامل الذي تم إجراؤه.

---

## 1. الهندسة المعمارية المقترحة

### 1.1 إعادة هيكلة الـ Frontend

```
src/
├── features/                    # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useSession.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts
│   │
│   ├── orders/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── products/
│   ├── customers/
│   ├── suppliers/
│   ├── installments/
│   └── admin/
│
├── shared/                      # Shared utilities
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   └── useLocalStorage.ts
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       └── helpers.ts
│
├── core/                        # Core functionality
│   ├── api/
│   │   ├── client.ts
│   │   ├── interceptors.ts
│   │   └── endpoints.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   └── config/
│       ├── constants.ts
│       └── env.ts
│
└── App.tsx
```

### 1.2 تقسيم ملف types.ts

```
src/types/
├── index.ts                     # Re-exports all types
├── user.types.ts                # User, Role, Permission types
├── order.types.ts               # Order, OrderItem, OrderStatus
├── product.types.ts             # Product, Category, Stock
├── customer.types.ts            # Customer, BusinessProfile
├── supplier.types.ts            # Supplier, Catalog, PO
├── quote.types.ts               # QuoteRequest, QuoteItem
├── installment.types.ts         # InstallmentRequest, Offer
├── notification.types.ts        # Notification types
├── settings.types.ts            # Settings, Config types
├── api.types.ts                 # API response types
└── common.types.ts              # Shared/common types
```

### 1.3 تقسيم ملف mockApi.ts

```
src/services/mock-api/
├── index.ts                     # Main export
├── core/
│   ├── storage.ts               # localStorage helpers
│   ├── defaults.ts              # Default data
│   └── utils.ts                 # Utility functions
├── domains/
│   ├── auth.mock.ts             # Authentication
│   ├── users.mock.ts            # User management
│   ├── orders.mock.ts           # Orders
│   ├── products.mock.ts         # Products
│   ├── quotes.mock.ts           # Quote requests
│   ├── suppliers.mock.ts        # Suppliers
│   ├── installments.mock.ts     # Installments
│   ├── notifications.mock.ts    # Notifications
│   └── settings.mock.ts         # Settings
└── types/
    └── mock.types.ts            # Mock-specific types
```

---

## 2. مكونات النظام

### 2.1 Error Boundary Component

```typescript
// src/shared/components/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 2.2 API Client with Interceptors

```typescript
// src/core/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2.3 Rate Limiting Middleware

```typescript
// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 failed attempts
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    error: 'API rate limit exceeded.',
  },
});
```

### 2.4 Input Validation with Zod

```typescript
// backend/src/schemas/validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  loginType: z.enum(['OWNER', 'STAFF']),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1, 'At least one item is required'),
  branchId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export const customerSchema = z.object({
  companyName: z.string().min(2).max(100),
  phone: z.string().regex(/^05\d{8}$/, 'Invalid Saudi phone number'),
  email: z.string().email().optional(),
  crNumber: z.string().regex(/^\d{10}$/, 'Invalid CR number').optional(),
  taxNumber: z.string().regex(/^\d{15}$/, 'Invalid VAT number').optional(),
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
};
```

### 2.5 CSRF Protection

```typescript
// backend/src/middleware/csrf.ts
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf_token';

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
};

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
    });
  }

  next();
};

export const setCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies[CSRF_COOKIE]) {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false, // Must be readable by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
  next();
};
```

---

## 3. نماذج البيانات

### 3.1 تحسين نموذج User

```typescript
// src/types/user.types.ts
export interface User {
  id: string;
  clientId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  extendedRole: ExtendedUserRole;
  status: UserStatus;
  isActive: boolean;
  
  // Relationships
  parentId: string | null;
  businessId: string | null;
  branchId: string | null;
  
  // Security
  lastLoginAt: Date | null;
  failedLoginAttempts: number;
  passwordChangedAt: Date | null;
  
  // Search Credits
  searchLimit: number;
  searchUsed: number;
  lastSearchDate: string | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'SUPER_ADMIN' | 'CUSTOMER_OWNER' | 'CUSTOMER_STAFF';

export type ExtendedUserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EMPLOYEE'
  | 'CUSTOMER'
  | 'SUPPLIER_LOCAL'
  | 'SUPPLIER_INTERNATIONAL'
  | 'MARKETER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'PENDING' | 'INACTIVE';
```

### 3.2 تحسين نموذج Order

```typescript
// src/types/order.types.ts
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  businessId: string | null;
  branchId: string | null;
  
  // Items
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  
  // Status
  status: OrderStatus;
  internalStatus: OrderInternalStatus;
  
  // Cancellation
  cancelledBy: 'CUSTOMER' | 'ADMIN' | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  
  // Notes
  customerNotes: string | null;
  internalNotes: string | null;
  
  // History
  statusHistory: OrderStatusHistoryItem[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderInternalStatus =
  | 'NEW'
  | 'SENT_TO_WAREHOUSE'
  | 'WAITING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'SALES_INVOICE_CREATED'
  | 'READY_FOR_SHIPMENT'
  | 'COMPLETED_INTERNAL'
  | 'CANCELLED_INTERNAL';
```

---

## 4. خصائص الصحة (Correctness Properties)

*خاصية الصحة هي سلوك أو خاصية يجب أن تكون صحيحة عبر جميع التنفيذات الصالحة للنظام.*

### Property 1: Error Boundary يلتقط الأخطاء
*لأي* مكون يرمي خطأ داخل Error Boundary، يجب أن يتم التقاط الخطأ وعرض واجهة بديلة بدلاً من تعطل التطبيق.
**Validates: Requirements 1.2**

### Property 2: Rate Limiting يحد الطلبات
*لأي* عنوان IP يرسل أكثر من الحد المسموح من الطلبات في الفترة الزمنية المحددة، يجب أن يتم رفض الطلبات الإضافية مع رمز حالة 429.
**Validates: Requirements 2.1**

### Property 3: Input Validation يرفض المدخلات غير الصالحة
*لأي* طلب API يحتوي على بيانات لا تتوافق مع المخطط المحدد، يجب أن يتم رفض الطلب مع رسالة خطأ واضحة.
**Validates: Requirements 2.2**

### Property 4: CSRF Protection يمنع الطلبات غير المصرح بها
*لأي* طلب POST/PUT/DELETE بدون token CSRF صالح، يجب أن يتم رفض الطلب مع رمز حالة 403.
**Validates: Requirements 2.3**

### Property 5: API Error Handling يعيد رسائل مناسبة
*لأي* خطأ في API، يجب أن تكون الاستجابة بتنسيق موحد يتضمن success: false ورسالة خطأ واضحة.
**Validates: Requirements 1.3**

### Property 6: React Query يخزن البيانات مؤقتاً
*لأي* استعلام بنفس المفتاح خلال فترة staleTime، يجب أن يتم إرجاع البيانات المخزنة مؤقتاً بدلاً من إجراء طلب جديد.
**Validates: Requirements 4.2**

---

## 5. معالجة الأخطاء

### 5.1 هيكل الأخطاء الموحد

```typescript
// src/core/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}
```

### 5.2 Error Handler Middleware

```typescript
// backend/src/middleware/errorHandler.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
      },
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
```

---

## 6. استراتيجية الاختبار

### 6.1 Unit Tests

```typescript
// src/services/__tests__/pricingEngine.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePrice, applyDiscount } from '../pricingEngine';

describe('PricingEngine', () => {
  describe('calculatePrice', () => {
    it('should return retail price for LEVEL_1 customers', () => {
      const product = { priceRetail: 100, priceWholesale: 80 };
      const result = calculatePrice(product, 'LEVEL_1');
      expect(result).toBe(100);
    });

    it('should return wholesale price for LEVEL_2 customers', () => {
      const product = { priceRetail: 100, priceWholesale: 80 };
      const result = calculatePrice(product, 'LEVEL_2');
      expect(result).toBe(80);
    });
  });

  describe('applyDiscount', () => {
    it('should apply percentage discount correctly', () => {
      const result = applyDiscount(100, { type: 'percentage', value: 10 });
      expect(result).toBe(90);
    });

    it('should apply fixed discount correctly', () => {
      const result = applyDiscount(100, { type: 'fixed', value: 15 });
      expect(result).toBe(85);
    });
  });
});
```

### 6.2 Integration Tests

```typescript
// backend/src/__tests__/orders.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server';

describe('Orders API', () => {
  let authToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'test', password: 'test123', loginType: 'OWNER' });
    authToken = res.body.token;
  });

  describe('POST /api/v1/orders', () => {
    it('should create order with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: 'prod-1', quantity: 2 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });

    it('should reject order without items', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ items: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
```

### 6.3 Property-Based Tests

```typescript
// src/services/__tests__/pricingEngine.property.test.ts
import { describe, it } from 'vitest';
import fc from 'fast-check';
import { calculatePrice, applyDiscount } from '../pricingEngine';

describe('PricingEngine Properties', () => {
  // Property 1: Price is always positive
  it('should always return positive price', () => {
    fc.assert(
      fc.property(
        fc.record({
          priceRetail: fc.float({ min: 0.01, max: 10000 }),
          priceWholesale: fc.float({ min: 0.01, max: 10000 }),
        }),
        fc.constantFrom('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'SPECIAL'),
        (product, level) => {
          const price = calculatePrice(product, level);
          return price > 0;
        }
      )
    );
  });

  // Property 2: Discount never exceeds original price
  it('should never result in negative price after discount', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.01, max: 10000 }),
        fc.record({
          type: fc.constantFrom('percentage', 'fixed'),
          value: fc.float({ min: 0, max: 100 }),
        }),
        (price, discount) => {
          const result = applyDiscount(price, discount);
          return result >= 0;
        }
      )
    );
  });
});
```

---

## 7. تحسينات الأداء

### 7.1 Code Splitting

```typescript
// src/App.tsx
import React, { Suspense, lazy } from 'react';

// Lazy load heavy components
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const SupplierPortal = lazy(() => import('./features/supplier/SupplierPortal'));
const CustomerDashboard = lazy(() => import('./features/customer/Dashboard'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/supplier/*" element={<SupplierPortal />} />
        <Route path="/*" element={<CustomerDashboard />} />
      </Routes>
    </Suspense>
  );
}
```

### 7.2 React Query Setup

```typescript
// src/core/query/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Custom hooks
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.products.list(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes for products
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.orders.list(),
    staleTime: 1 * 60 * 1000, // 1 minute for orders
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOrderData) => api.orders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
```

### 7.3 Virtual List for Large Data

```typescript
// src/shared/components/VirtualList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      style={{ height: containerHeight, overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. ملخص التصميم

### المكونات الرئيسية
1. **إعادة هيكلة الكود** - Feature-based architecture
2. **Error Boundaries** - معالجة أخطاء React
3. **API Client** - Axios مع interceptors
4. **Rate Limiting** - حماية من الطلبات المفرطة
5. **Input Validation** - Zod schemas
6. **CSRF Protection** - حماية من CSRF
7. **Error Handling** - نظام أخطاء موحد
8. **Testing** - Unit, Integration, Property tests
9. **Performance** - Code splitting, React Query, Virtual lists

### التقنيات المضافة
- `@tanstack/react-query` - للتخزين المؤقت
- `@tanstack/react-virtual` - للقوائم الافتراضية
- `vitest` - للاختبارات
- `fast-check` - للاختبارات القائمة على الخصائص
- `express-rate-limit` - لتحديد معدل الطلبات
