// GSAP plugin registration
// Registers ScrollTrigger and other plugins

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

// Export configured gsap instance
export { gsap, ScrollTrigger };

// Default configuration
gsap.defaults({
  ease: 'power3.out',
  duration: 1,
});

// ScrollTrigger defaults
ScrollTrigger.defaults({
  // markers: true, // Debug markers
});