export const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const lerp = (from, to, t) => from + (to - from) * t;

export const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const randomBetween = (min, max) => min + Math.random() * (max - min);

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** CSS의 @media (max-width: 860px)와 같은 기준 */
export const MOBILE_MAX_WIDTH = 860;

/** CSS의 --content-width와 같은 값 */
export const CONTENT_MAX_WIDTH = 1080;
