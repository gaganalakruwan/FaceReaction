/**
 * constants/scale.js
 *
 * Provides a scale() helper so every font, padding, and size
 * grows proportionally on large screens (kiosk / 32-inch TV).
 *
 * Breakpoints:
 *   Phone   < 600dp   → scale 1.0  (baseline)
 *   Tablet  600–1024  → scale 1.45
 *   Kiosk  >1024      → scale 2.2   (32-inch screen)
 */

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Pick the right multiplier for this screen
export const SCALE =
  width >= 1024 ? 2.2 :
  width >= 600  ? 1.45 :
  1.0;

/**
 * scale(value) — multiply any size by the screen factor
 * Usage:  fontSize: scale(14)   padding: scale(24)
 */
export function scale(value) {
  return Math.round(value * SCALE);
}

// Convenience: is this a large kiosk screen?
export const IS_KIOSK  = width >= 1024;
export const IS_TABLET = width >= 600;