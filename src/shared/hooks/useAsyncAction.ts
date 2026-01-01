import { useState, useCallback } from 'react';

/**
 * useAsyncAction - Hook موحد للإجراءات غير المتزامنة
 * 
 * يوفر حالة loading/error موحدة لأي action
 * 
 * @example
 * const { execute, loading, error } = useAsyncAction(async (data) => {
 *   await Api.saveData(data);
 * }, {
 *   onSuccess: () => toast('تم الحفظ'),
 *   onError: (err) => toast(err.message, 'error')
 * });
 * 
 * <button onClick={() => execute(myData)} disabled={loading}>
 *   {loading ? 'جاري...' : 'حفظ'}
 * </button>
 */

export interface UseAsyncActionOptions<T> {
  /** Callback عند النجاح */
  onSuccess?: (result: T) => void;
  /** Callback عند الخطأ */
  onError?: (error: Error) => void;
  /** Callback عند الانتهاء (نجاح أو فشل) */
  onSettled?: () => void;
  /** رسالة خطأ افتراضية */
  defaultErrorMessage?: string;
}

export interface UseAsyncActionResult<TArgs extends unknown[], TResult> {
  /** تنفيذ الـ action */
  execute: (...args: TArgs) => Promise<TResult | null>;
  /** حالة التحميل */
  loading: boolean;
  /** رسالة الخطأ (إن وجدت) */
  error: string | null;
  /** مسح الخطأ */
  clearError: () => void;
  /** إعادة تعيين الحالة */
  reset: () => void;
}

export function useAsyncAction<TArgs extends unknown[], TResult = void>(
  action: (...args: TArgs) => Promise<TResult>,
  options: UseAsyncActionOptions<TResult> = {}
): UseAsyncActionResult<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    onSettled,
    defaultErrorMessage = 'حدث خطأ غير متوقع',
  } = options;

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await action(...args);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : defaultErrorMessage;
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
        return null;
      } finally {
        setLoading(false);
        onSettled?.();
      }
    },
    [action, onSuccess, onError, onSettled, defaultErrorMessage]
  );

  const clearError = useCallback(() => setError(null), []);
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    execute,
    loading,
    error,
    clearError,
    reset,
  };
}

export default useAsyncAction;
