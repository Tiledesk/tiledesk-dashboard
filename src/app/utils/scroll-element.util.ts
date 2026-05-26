/** easeInOutCirc — same easing as the former scrollto-with-animation package */
function easeInOutCirc(t: number): number {
  return t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
}

/**
 * Animates element.scrollTop or scrollLeft (replacement for scrollto-with-animation).
 */
export function scrollElementWithAnimation(
  element: HTMLElement,
  property: 'scrollTop' | 'scrollLeft',
  to: number,
  durationMs = 500,
  onComplete?: () => void
): void {
  const start = element[property];
  const change = to - start;

  if (!durationMs || change === 0) {
    element[property] = to;
    onComplete?.();
    return;
  }

  const startTime = performance.now();

  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / durationMs);
    element[property] = start + change * easeInOutCirc(t);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      element[property] = to;
      onComplete?.();
    }
  };

  requestAnimationFrame(step);
}
