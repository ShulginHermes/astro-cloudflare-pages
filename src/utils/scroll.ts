// Scroll utilities for scroll-driven animations

import { gsap, ScrollTrigger } from '../scripts/gsap-register';
import { getLenis } from '../scripts/lenis';

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Creates a scroll progress tracker for an element
 * @param element Target element
 * @param callback Called with progress (0-1)
 */
export function createScrollProgress(
  element: Element | string,
  callback: (progress: number) => void,
  options?: { start?: string; end?: string; scrub?: number | boolean }
): ScrollTrigger {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  
  if (!target) return null as any;
  
  return ScrollTrigger.create({
    trigger: target,
    start: options?.start || 'top bottom',
    end: options?.end || 'bottom top',
    scrub: options?.scrub ?? true,
    onUpdate: (self: ScrollTrigger) => {
      callback(self.progress);
    },
  });
}

/**
 * Creates a horizontal scroll section
 * @param container Container element
 * @param options Configuration
 */
export function createHorizontalScroll(
  container: Element,
  options: {
    sections: Element[];
    onProgress?: (progress: number, index: number) => void;
    snap?: number | boolean;
  }
): ScrollTrigger {
  const wrapper = container.querySelector('[data-scroll-wrapper]') as HTMLElement;
  if (!wrapper) return null as any;
  
  const sections = options.sections;
  const totalWidth = sections.reduce((sum, s) => sum + s.clientWidth, 0);
  
  return ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: () => `+=${totalWidth - container.clientWidth}`,
    pin: true,
    scrub: 1,
    horizontal: true,
    onUpdate: (self: ScrollTrigger) => {
      if (options.onProgress) {
        const progress = self.progress;
        const sectionIndex = Math.min(
          Math.floor(progress * sections.length),
          sections.length - 1
        );
        options.onProgress(progress, sectionIndex);
      }
    },
  });
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(
  element: Element | string,
  options?: { offset?: number; duration?: number }
): void {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) return;
  
  const lenis = getLenis();
  
  if (lenis) {
    lenis.scrollTo(target, { offset: options?.offset ?? 0 });
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lerp utility for smooth interpolation
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}