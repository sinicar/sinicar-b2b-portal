import type { RefreshResult } from "./types";

/**
 * sessionRefresh (COPY ONLY)
 * Placeholder refresh function. Not wired yet.
 *
 * In M2 we will call this behind a feature flag when receiving 401 responses.
 * For now it throws to prevent accidental usage.
 */
export async function sessionRefresh(): Promise<RefreshResult> {
  throw new Error("sessionRefresh is not wired yet (M1 scaffolding only).");
}
