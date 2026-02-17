/**
 * Type definitions for the Vega Performance Monitor API.
 *
 * The Performance Monitor API provides utilities for tracking and analyzing
 * app performance metrics on Vega OS devices. It covers key performance
 * indicators (KPIs) such as frame rates, memory usage, and render timing,
 * enabling developers to identify bottlenecks and optimize their apps.
 *
 * @see {@link https://developer.amazon.com/docs/vega/0.22/improve-performance-overview.html | Vega Performance Docs}
 * @module performance-monitor/types
 */

/**
 * Severity levels for performance warnings emitted by the monitor.
 *
 * Used by {@link PerformanceWarning} to classify the impact of a
 * detected performance issue.
 *
 * @example
 * ```typescript
 * if (warning.severity === WarningSeverity.CRITICAL) {
 *   console.error('Critical performance issue detected');
 * }
 * ```
 */
export enum WarningSeverity {
  /** Informational — no immediate action required. */
  INFO = 'info',
  /** Moderate impact — may degrade user experience under load. */
  WARNING = 'warning',
  /** Severe impact — likely causing visible jank or unresponsiveness. */
  CRITICAL = 'critical',
}

/**
 * Categories of performance metrics tracked by the monitor.
 *
 * Each category maps to a specific area of app performance as described
 * in the Vega performance best practices documentation.
 *
 * @see {@link PerformanceSample}
 */
export enum MetricCategory {
  /** UI frame rendering fluidity (FPS). */
  FLUIDITY = 'fluidity',
  /** JavaScript heap and native memory usage. */
  MEMORY = 'memory',
  /** Component render count and duration. */
  RENDER = 'render',
  /** Network request latency and throughput. */
  NETWORK = 'network',
  /** App startup timing (TTFF / TTFD). */
  STARTUP = 'startup',
}

/**
 * A single performance measurement sample captured at a point in time.
 *
 * Samples are collected by the {@link PerformanceMonitor} and stored
 * for later analysis or export.
 *
 * @see {@link MetricCategory}
 *
 * @example
 * ```typescript
 * const sample: PerformanceSample = {
 *   timestamp: Date.now(),
 *   category: MetricCategory.FLUIDITY,
 *   name: 'fps',
 *   value: 58.3,
 *   unit: 'fps',
 * };
 * ```
 */
export interface PerformanceSample {
  /** Unix timestamp in milliseconds when the sample was captured. */
  timestamp: number;
  /** The performance category this sample belongs to. */
  category: MetricCategory;
  /** Human-readable metric name (e.g., "fps", "jsHeapUsedMB"). */
  name: string;
  /** The measured value. */
  value: number;
  /** Unit of measurement (e.g., "fps", "MB", "ms"). */
  unit: string;
  /** Optional metadata for additional context. */
  metadata?: Record<string, string>;
}

/**
 * A performance warning generated when a metric exceeds its threshold.
 *
 * @see {@link WarningSeverity}
 * @see {@link PerformanceThreshold}
 *
 * @example
 * ```typescript
 * const warning: PerformanceWarning = {
 *   timestamp: Date.now(),
 *   severity: WarningSeverity.WARNING,
 *   category: MetricCategory.FLUIDITY,
 *   message: 'FPS dropped below 55',
 *   sample: { ... },
 * };
 * ```
 */
export interface PerformanceWarning {
  /** Unix timestamp when the warning was generated. */
  timestamp: number;
  /** Severity of the warning. */
  severity: WarningSeverity;
  /** The metric category that triggered the warning. */
  category: MetricCategory;
  /** Human-readable description of the issue. */
  message: string;
  /** The sample that triggered this warning. */
  sample: PerformanceSample;
}

/**
 * Defines a threshold rule for a specific metric.
 *
 * When a recorded sample's value crosses the threshold boundary
 * (above for `"above"`, below for `"below"`), a {@link PerformanceWarning}
 * is emitted.
 *
 * @example
 * ```typescript
 * const fpsThreshold: PerformanceThreshold = {
 *   metricName: 'fps',
 *   category: MetricCategory.FLUIDITY,
 *   warnAboveOrBelow: 'below',
 *   value: 55,
 *   severity: WarningSeverity.WARNING,
 * };
 * ```
 */
export interface PerformanceThreshold {
  /** The metric name this threshold applies to. */
  metricName: string;
  /** The metric category. */
  category: MetricCategory;
  /** Whether to warn when the value goes above or below the threshold. */
  warnAboveOrBelow: 'above' | 'below';
  /** The threshold value. */
  value: number;
  /** Severity to assign to warnings triggered by this threshold. */
  severity: WarningSeverity;
}

/**
 * Callback type for receiving performance warnings in real time.
 *
 * @param warning - The performance warning that was generated.
 *
 * @see {@link PerformanceWarning}
 */
export type PerformanceWarningListener = (warning: PerformanceWarning) => void;

/**
 * Summary statistics for a collection of performance samples.
 *
 * Produced by {@link PerformanceMonitor.getSummary} to give a quick
 * overview of recorded metrics.
 *
 * @example
 * ```typescript
 * const summary: PerformanceSummary = {
 *   category: MetricCategory.FLUIDITY,
 *   metricName: 'fps',
 *   sampleCount: 120,
 *   min: 42.1,
 *   max: 60.0,
 *   mean: 57.8,
 *   p95: 55.2,
 * };
 * ```
 */
export interface PerformanceSummary {
  /** The metric category. */
  category: MetricCategory;
  /** The metric name. */
  metricName: string;
  /** Total number of samples collected. */
  sampleCount: number;
  /** Minimum recorded value. */
  min: number;
  /** Maximum recorded value. */
  max: number;
  /** Arithmetic mean of all samples. */
  mean: number;
  /** 95th percentile value. */
  p95: number;
}
