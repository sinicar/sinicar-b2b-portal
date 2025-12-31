# Admin Dashboard Modularization Map

## Goal
Incremental safe refactor (MOVE ONLY) without changing production behavior.

## Extracted Components (Wired)
- `src/features/admin/components/AdminDashboardHeader.tsx`
  - Includes: ConnectionWidget, LanguageSwitcherLight, NotificationBell, user info, page title
- `src/features/admin/components/AdminStatsCards.tsx`
  - KPI/Stat cards grid
- `src/features/admin/components/AdminChartsSection.tsx`
  - Revenue AreaChart + Orders BarChart
- `src/features/admin/components/AdminQuickActions.tsx`
  - Quick tools/actions buttons
- `src/features/admin/components/AdminActivitySection.tsx`
  - Insights + activity summary + latest notifications

## Original File
- `src/components/AdminDashboard.tsx`

## Current Status
- AdminDashboard.tsx reduced from 1107 lines → 880 lines (~-20.5%)
- Verified after each step: deps + typecheck + build

## What remains inside AdminDashboard.tsx (to review next)
- View/state orchestration (view switching)
- Data fetching / memoization / derived state
- Sidebar navigation (~140 lines)
- View handlers (views switch/case blocks ~300+ lines)

## Regression Checklist
- Admin Dashboard loads and renders:
  - Header widgets (language, notifications, connection)
  - KPI cards (4 cards)
  - Charts (revenue + orders)
  - Quick actions (4 buttons)
  - Activity/insights/notifications
- `npm run verify` passes
