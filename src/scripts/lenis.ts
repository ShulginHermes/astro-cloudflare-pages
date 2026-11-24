// Lenis smooth scroll initialization with GSAP ScrollTrigger sync
// Provides buttery smooth scrolling and integrates with GSAP

import Lenis from 'lenis';
import type { LenisOptions, ScrollToOptions } from 'lenis';
import { gsap, ScrollTrigger } from './gsap-register';

let lenisInstance: Lenis | null = null;

/**
 * Initialize Lenis smooth scroll
 * @param options Lenis options
 * @returns Lenis instance
 */
export function initLenis(options?: Partial<LenisOptions>): Lenis {
  if (lenisInstance) {
    return lenisInstance;
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  lenisInstance = new Lenis({
    duration: prefersReducedMotion ? 0 : 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: !prefersReducedMotion,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
    autoRaf: false,
    respectReducedMotion: true,
    ...options,
  });

  // Sync Lenis with GSAP ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);

  // GSAP ticker to drive Lenis
  gsap.ticker.add((time: number) => {
    lenisInstance?.raf(time * 1000);
  });

  // Prevent GSAP from auto-updating on scroll (Lenis handles it)
  gsap.ticker.lagSmoothing(0);

  // Listen for reduced motion changes
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handleChange = (e: MediaQueryListEvent) => {
    lenisInstance?.destroy();
    lenisInstance = null;
    initLenis(options);
  };
  mediaQuery.addEventListener('change', handleChange);

  return lenisInstance;
}

/**
 * Get the current Lenis instance
 */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Scroll to a target element or position
 */
export function scrollTo(target: string | Element | number, options?: ScrollToOptions): void {
  lenisInstance?.scrollTo(target, options);
}

/**
 * Stop Lenis (cleanup)
 */
export function stopLenis(): void {
  if (lenisInstance) {
    gsap.ticker.remove(() => {});
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

export { Lenis };