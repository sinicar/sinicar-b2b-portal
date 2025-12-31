# SINI CAR B2B - Documentation Index

> Master Index for All Documentation | توثيق شامل للنظام

---

## 📚 Documentation Files (ملفات التوثيق)

| File                                                                 | Description                            | When to Read                      |
| -------------------------------------------------------------------- | -------------------------------------- | --------------------------------- |
| [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)                           | Platform description, folder structure | **Start here** for new developers |
| [DATABASE_REPORT.md](./DATABASE_REPORT.md)                           | Prisma schema, models, relationships   | Before database changes           |
| [API_CONTRACTS_MAP.md](./API_CONTRACTS_MAP.md)                       | Frontend ↔ Backend API reference       | Before adding API calls           |
| [AUTH_AND_ROLES.md](./AUTH_AND_ROLES.md)                             | Authentication, tokens, RBAC           | Before auth changes               |
| [PERMISSIONS_CENTER_DEEP_DIVE.md](./PERMISSIONS_CENTER_DEEP_DIVE.md) | Permission management UI               | Editing permission center         |
| [ROUTING_AND_VIEWS_REPORT.md](./ROUTING_AND_VIEWS_REPORT.md)         | Routes, navigation, layouts            | Adding new pages                  |
| [BUSINESS_FLOWS.md](./BUSINESS_FLOWS.md)                             | End-to-end user scenarios              | Understanding workflows           |
| [MAINTAINABILITY_RULES.md](./MAINTAINABILITY_RULES.md)               | Coding standards, safe editing         | **Read before any changes**       |

---

## 🚀 Quick Start for New Developers (البداية السريعة)

### 1. Setup

```bash
# Clone repository
git clone <repo-url>
cd sini-car-b2b

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Setup environment
cp .env.example .env
cp backend/.env.example backend/.env
# Edit .env files with your database URL
```

### 2. Run Development Servers

```bash
# Terminal 1: Frontend (port 3000)
npm run dev

# Terminal 2: Backend (port 3005)
cd backend && npm run dev
```

### 3. Test Login

- Open http://localhost:3000
- Login with test credentials (from seed data)

---

## 🔧 Common Tasks (المهام الشائعة)

### "ماذا أفعل لو انكسر Build؟"

```bash
# 1. Check TypeScript errors
npm run typecheck

# 2. Check build errors
npm run build

# 3. Look at error message and fix

# Common fixes:
# - Missing import → Add import statement
# - Type error → Fix type or add proper typing
# - Missing translation → Add key to locales/*.json
```

### "أين أعدل API؟"

1. **New endpoint**: Add to `src/services/api/modules/<module>.ts`
2. **Export**: Add to `src/services/api/modules/index.ts`
3. **Main client**: If needed, add to `src/services/apiClient.ts`
4. **NEVER edit**: `src/services/api.ts` (facade layer)

See [API_CONTRACTS_MAP.md](./API_CONTRACTS_MAP.md) for details.

### "كيف أضيف صفحة جديدة؟"

1. Create component in `src/components/` or `src/features/`
2. Add view type to portal
3. Add sidebar navigation
4. Add render case
5. Run `npm run typecheck && npm run build`

See [ROUTING_AND_VIEWS_REPORT.md](./ROUTING_AND_VIEWS_REPORT.md) for step-by-step guide.

---

## 🧪 Verification Commands (أوامر التحقق)

```bash
# Type checking - Run before every commit
npm run typecheck

# Full build - Run before merge
npm run build

# Backend
cd backend && npm run build
```

---

## 📁 Project Structure Quick Reference

```
SINI CAR B2B/
├── src/                    # Frontend React code
│   ├── components/         # UI components (74 files)
│   ├── features/          # Feature modules
│   ├── services/          # API, contexts, logic
│   └── types/             # TypeScript types
├── backend/               # Backend Node.js code
│   ├── src/modules/       # API modules (30 dirs)
│   └── prisma/            # Database schema
└── docs/                  # Documentation (this folder)
```

---

## ⚠️ Critical Files - Handle with Care

| File                           | Reason                               |
| ------------------------------ | ------------------------------------ |
| `src/services/api.ts`          | DO NOT EDIT - facade layer           |
| `backend/prisma/schema.prisma` | Database schema - coordinate changes |
| `src/App.tsx`                  | Main routing - test thoroughly       |
| `src/types.ts`                 | 131KB shared types - prefer modular  |

---

## 📖 Additional Resources

- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) - Original project context
- [backend/BACKEND_OVERVIEW.md](../backend/BACKEND_OVERVIEW.md) - Backend documentation
- [backend/HANDOFF_TO_DEV.md](../backend/HANDOFF_TO_DEV.md) - Developer handoff notes

---

## 🆘 Need Help?

1. Check relevant documentation file above
2. Search codebase: `grep -r "keyword" src/`
3. Check console for error messages
4. Review recent git commits for similar changes

---

_Last Updated: 2025-12-31_
