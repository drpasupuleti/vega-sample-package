/**
 * Overdraw Detector module — re-exports all types and functions.
 *
 * @module overdraw-detector
 */

export {
  OverdrawLevel,
  type ViewNode,
  type ViewBounds,
  type OverdrawResult,
  type OverdrawReport,
} from './types';

export {
  analyzeOverdraw,
  classifyOverdraw,
  boundsOverlap,
} from './overdraw-detector';
