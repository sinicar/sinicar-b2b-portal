# Session Refresh Plan (Incremental)

## Goal
Add access-token refresh without breaking existing API contracts or user flows.

## Steps
- M1: Add scaffolding files (no wiring).
- M2: Wire behind a feature flag (disabled by default).
- M3: Enable in dev environment first, add smoke tests.

## Rules
- No behavior change unless the flag is enabled.
- Always run: npm run verify.
