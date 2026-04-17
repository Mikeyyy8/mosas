import { useCallback, useRef } from 'react';

/**
 * A custom hook that returns a throttled version of the provided function.
 * @param callback The function to throttle.
 * @param delay The throttle delay in milliseconds.
 * @returns A throttled function.
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
) => {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      }
    },
    [callback, delay]
  );
};
