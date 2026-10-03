/**
 * utilities.js — small reusable helpers used across the game.
 */

/**
 * Wait for a given number of milliseconds.
 * Returns a promise that resolves after `ms` ms,
 * but can be cancelled via the provided signal.
 */
export function wait(ms, signal = null) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

/**
 * Add a CSS class to an element, optionally removing it after `removeAfterMs`.
 */
export function addClassTemporary(el, className, removeAfterMs) {
  el.classList.add(className);
  if (removeAfterMs != null) {
    setTimeout(() => el.classList.remove(className), removeAfterMs);
  }
}

/**
 * Clamp a numeric value between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation.
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Resolve an asset path relative to the project root.
 * Handles both relative and absolute path conventions.
 */
export function assetPath(relativePath) {
  // Strip leading slash to ensure relative resolution
  return relativePath.replace(/^\//, '');
}
