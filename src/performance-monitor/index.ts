/**
 * Performance Monitor module — re-exports all types and classes.
 *
 * @module performance-monitor
 */

export {
  WarningSeverity,
  MetricCategory,
  type PerformanceSample,
  type PerformanceWarning,
  type PerformanceThreshold,
  type PerformanceWarningListener,
  type PerformanceSummary,
} from './types';

export { PerformanceMonitor } from './performance-monitor';
