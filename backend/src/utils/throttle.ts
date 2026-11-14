// Runs `fn` at most once per interval and drops the calls in between.
// The clock is injectable so that tests do not have to wait.
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  intervalMs: number,
  now: () => number = Date.now
) {
  let last = -Infinity;
  return (...args: A) => {
    const current = now();
    if (current - last >= intervalMs) {
      last = current;
      fn(...args);
    }
  };
}
