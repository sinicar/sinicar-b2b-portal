import React from "react";

export type ErrorFallbackProps = {
  error?: Error;
  onRetry?: () => void;
};

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-600 mb-4">
          The app hit an unexpected error. You can try again.
        </p>
        {error ? (
          <pre className="text-xs bg-gray-50 border rounded-xl p-3 overflow-auto mb-4">
            {String(error.message || error)}
          </pre>
        ) : null}
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-brand-600 text-white"
            onClick={() => (onRetry ? onRetry() : window.location.reload())}
          >
            Retry
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl border"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
