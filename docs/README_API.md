# API Configuration & Service Layer Documentation

This document explains the API configuration, HTTP client, and service layer architecture for the SINI CAR B2B Wholesale Portal.

## Overview

The application uses a modular API architecture that supports two modes:

- **Mock Mode** (default): Uses localStorage-based mock API for development and demo
- **REST Mode**: Uses real HTTP backend API (for future production use)

## Quick Start

### Switching Between Mock and REST Modes

By default, the application runs in **mock mode**. To switch to REST mode:

1. Set environment variables in your `.env` file:

```env
VITE_API_MODE=rest
VITE_API_BASE_URL=https://your-api-server.com/v1
VITE_API_KEY=your-api-key-if-needed
```

2. If `VITE_API_MODE` is set to `rest` but `VITE_API_BASE_URL` is not provided, the app will automatically fall back to mock mode.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_MODE` | API mode: `mock` or `rest` | `mock` |
| `VITE_API_BASE_URL` | Base URL for REST API | `https://api.sini-pro-erp.com/v1` |
| `VITE_API_KEY` | API key for authentication | (none) |
| `VITE_NODE_ENV` | Environment: `development`, `production`, `test` | `development` |

## File Structure

```
services/
├── apiConfig.ts       # Central configuration (env, mode, timeouts, endpoints)
├── httpClient.ts      # Reusable HTTP client with retry logic
├── serviceFactory.ts  # Service interfaces and factory functions
├── mockApi.ts         # Mock API implementation (localStorage-based)
├── realApi.ts         # Legacy REST API (for reference)
└── types/
    └── index.ts       # Shared TypeScript DTOs
```

## Architecture

### 1. API Configuration (`apiConfig.ts`)

The central configuration module exports:

```typescript
import { apiConfig, isMockMode, isRestMode, STORAGE_KEYS } from './apiConfig';

// Check current mode
if (isMockMode()) {
  console.log('Using mock API');
}

// Access configuration
console.log(apiConfig.baseUrl);       // Base URL
console.log(apiConfig.apiMode);       // 'mock' or 'rest'
console.log(apiConfig.env);           // 'development', 'production', 'test'
console.log(apiConfig.timeouts);      // Timeout configuration
console.log(apiConfig.retry);         // Retry configuration
console.log(apiConfig.endpoints);     // API endpoint paths
```

### 2. HTTP Client (`httpClient.ts`)

A standardized HTTP client with:

- Automatic base URL injection
- Default headers (JSON, auth token)
- Retry mechanism with exponential backoff
- Normalized response shape
- Error handling with Arabic messages

```typescript
import { httpClient, ApiResponse } from './httpClient';

// GET request
const result: ApiResponse<Product[]> = await httpClient.get('/products');

if (result.success) {
  console.log(result.data);  // Product[]
} else {
  console.error(result.error);  // Error message in Arabic
}

// POST request with body
const createResult = await httpClient.post<Order>('/orders', { items: [...] });

// With options
const result = await httpClient.get('/products', {
  params: { search: 'filter' },
  timeout: 5000,
  retries: 2
});
```

#### Response Shape

All HTTP client methods return:

```typescript
interface ApiResponse<T> {
  data: T | null;           // Response data (null if error)
  error: string | null;     // Error message (null if success)
  status: number;           // HTTP status code
  success: boolean;         // Whether request succeeded
  headers?: Record<string, string>;
  meta?: {
    url: string;
    method: string;
    duration: number;
    retries: number;
  };
}
```

### 3. Service Factory (`serviceFactory.ts`)

Provides typed service interfaces that abstract the underlying implementation:

```typescript
import { services, getAuthService, getOrderService } from './serviceFactory';

// Option 1: Use the unified services container
const result = await services.auth.login('1', '1', 'OWNER');
const orders = await services.orders.getAllOrders();

// Option 2: Get individual services
const authService = getAuthService();
const orderService = getOrderService();
```

#### Available Services

| Service | Description |
|---------|-------------|
| `services.auth` | Authentication (login, logout, session) |
| `services.users` | User/Staff management |
| `services.customers` | Customer database operations |
| `services.products` | Product search and management |
| `services.orders` | Order CRUD operations |
| `services.quotes` | Quote request management |
| `services.imports` | Import from China requests |
| `services.missingParts` | Missing parts tracking |
| `services.notifications` | User notifications |
| `services.activityLogs` | Activity logging |
| `services.accountRequests` | Account opening requests |
| `services.settings` | Site settings |
| `services.branches` | Branch management |
| `services.adminStats` | Admin dashboard statistics |

## Adding New Endpoints/Services

### Step 1: Define Interface

Add the interface in `serviceFactory.ts`:

```typescript
export interface IMyNewService {
  getItems(): Promise<MyItem[]>;
  createItem(data: CreateItemRequest): Promise<MyItem>;
}
```

### Step 2: Add Mock Implementation

Implement the methods in `mockApi.ts`:

```typescript
export const MockApi = {
  // ... existing methods ...
  
  async getMyItems(): Promise<MyItem[]> {
    // localStorage-based implementation
  },
  
  async createMyItem(data: CreateItemRequest): Promise<MyItem> {
    // localStorage-based implementation
  }
};
```

### Step 3: Create Service Factory Function

Add the factory function in `serviceFactory.ts`:

```typescript
function createMyNewService(): IMyNewService {
  return {
    async getItems() {
      const api = await getMockApi();
      return api.getMyItems();
    },
    async createItem(data) {
      const api = await getMockApi();
      return api.createMyItem(data);
    }
  };
}

export function getMyNewService(): IMyNewService {
  return createMyNewService();
}
```

### Step 4: Add to Services Container

Update the `services` object:

```typescript
export const services = {
  // ... existing services ...
  get myNew() { return getMyNewService(); }
};
```

### Step 5: Add REST Implementation (When Backend is Ready)

When the real backend is available, implement the REST version:

```typescript
function createRestMyNewService(): IMyNewService {
  return {
    async getItems() {
      const response = await httpClient.get<MyItem[]>('/my-items');
      if (!response.success) throw new Error(response.error || 'Failed');
      return response.data!;
    },
    async createItem(data) {
      const response = await httpClient.post<MyItem>('/my-items', data);
      if (!response.success) throw new Error(response.error || 'Failed');
      return response.data!;
    }
  };
}
```

Then update the factory function to switch based on mode:

```typescript
export function getMyNewService(): IMyNewService {
  if (isMockMode()) {
    return createMockMyNewService();
  }
  return createRestMyNewService();
}
```

## localStorage Keys

The mock API uses these localStorage keys (defined in `apiConfig.ts`):

| Key | Purpose |
|-----|---------|
| `b2b_users_sini_v2` | User accounts |
| `b2b_profiles_sini_v2` | Business profiles |
| `b2b_orders_sini_v2` | Orders |
| `b2b_quotes_sini_v2` | Quote requests |
| `b2b_session_sini_v2` | Current session |
| `b2b_settings_sini_v2` | Site settings |
| `b2b_products_sini_v2` | Products catalog |
| `b2b_banners_sini_v2` | Banner content |
| `b2b_news_sini_v2` | News ticker |
| `b2b_search_history_sini_v2` | Search history |
| `b2b_missing_requests_sini_v2` | Missing parts requests |
| `b2b_import_requests_sini_v2` | Import requests |
| `siniCar_account_opening_requests` | Account opening requests |
| `siniCar_notifications_v2` | Notifications |
| `siniCar_activity_logs` | Activity logs |

## Test Credentials

For demo/testing purposes:

| Role | Credentials |
|------|-------------|
| Admin | username: `admin`, password: `admin` |
| Customer Owner | clientId: `1`, password: `1` |
| Staff | mobile: `0500056988`, activationCode: `381960` |

## Error Handling

The HTTP client provides localized error messages in Arabic:

| Error Code | Arabic Message |
|------------|----------------|
| `NETWORK_ERROR` | لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت. |
| `TIMEOUT` | انتهت مهلة الطلب. يرجى المحاولة مرة أخرى. |
| `UNAUTHORIZED` | انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى. |
| `FORBIDDEN` | ليس لديك صلاحية للوصول إلى هذا المورد. |
| `NOT_FOUND` | المورد المطلوب غير موجود. |
| `VALIDATION_ERROR` | البيانات المدخلة غير صالحة. |
| `SERVER_ERROR` | حدث خطأ في الخادم. يرجى المحاولة لاحقاً. |

## Debug Mode

Debug logging is automatically enabled in development mode. To see HTTP request/response logs, check the browser console.

```typescript
import { debugLog, errorLog } from './apiConfig';

// These only log in development mode
debugLog('myCategory', 'Debug message', { data: 'value' });
errorLog('myCategory', 'Error message', error, { context: 'value' });
```
