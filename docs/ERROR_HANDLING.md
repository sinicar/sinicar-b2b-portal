# Error Handling & Recovery

> Last Updated: 2026-01-01

## Overview

The application uses a global `AppErrorBoundary` to catch and handle React errors gracefully, preventing white screen crashes.

---

## Components

### AppErrorBoundary
- **Location**: `src/components/error/AppErrorBoundary.tsx`
- **Purpose**: Catches JavaScript errors in child component tree
- **Behavior**: Renders `ErrorFallback` UI when an error occurs

### ErrorFallback
- **Location**: `src/components/error/ErrorFallback.tsx`
- **Purpose**: User-friendly error display with recovery options
- **Features**:
  - Shows error message
  - **Retry** button: Clears error state and re-renders
  - **Reload** button: Full page refresh

---

## Wiring

The boundary is wired at the app root level in `App.tsx`:

```tsx
<ProgrammingModeProvider>
    <ToastContainer />
    <AppErrorBoundary>
        <AppContent />
    </AppErrorBoundary>
    <AIAssistant />
    <FloatingAIButton />
    <AICommandModal />
</ProgrammingModeProvider>
```

---

## What Users See on Crash

When an error occurs, users see:

1. **Heading**: "Something went wrong"
2. **Description**: Brief explanation
3. **Error Details**: Technical message in a code block
4. **Actions**:
   - "Retry" - Attempts recovery without page reload
   - "Reload" - Full page refresh

---

## Verification Checklist

- [ ] App loads normally
- [ ] Intentional error triggers fallback UI (dev only)
- [ ] "Retry" button clears error state
- [ ] "Reload" button refreshes page
- [ ] `npm run verify` passes

---

## Future Enhancements

1. **Error Reporting**: Integrate with Sentry/monitoring
2. **Per-Portal Boundaries**: Wrap each portal (Admin/Customer/Supplier) separately
3. **Lazy View Boundaries**: Catch lazy-load failures individually
