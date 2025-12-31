import React from "react";

/**
 * AdminSuspenseFallback (MOVE ONLY)
 * Reusable fallback spinner for lazy-loaded admin views.
 */
export function AdminSuspenseFallback() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
    </div>
  );
}

export default AdminSuspenseFallback;
