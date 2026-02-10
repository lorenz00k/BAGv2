"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value`.
 * The returned value only updates after `delayMs` of inactivity.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
