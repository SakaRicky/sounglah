import { useCallback, useMemo, useRef } from 'react';

/**
 * Hook that memoizes a callback and its dependencies for expensive operations
 * @param callback The callback function to memoize
 * @param dependencies The dependencies array
 * @returns The memoized callback
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  const callbackRef = useRef<T>(callback);
  
  // Update the ref if callback changes
  callbackRef.current = callback;
  
  // Memoize the callback with dependencies
  const memoizedCallback = useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, dependencies) as T;
  
  return memoizedCallback;
}

/**
 * Hook for memoizing expensive calculations with automatic cleanup
 * @param factory The factory function that creates the value
 * @param dependencies The dependencies array
 * @returns The memoized value
 */
export function useMemoizedValue<T>(
  factory: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(factory, dependencies);
} 