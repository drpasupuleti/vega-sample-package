/**
 * Core performance monitoring logic for Vega apps.
 *
 * Provides a centralized monitor for recording performance samples,
 * evaluating threshold rules, and emitting warnings when metrics
 * degrade. Inspired by the Vega App KPI Visualizer and performance
 * best practices for measuring TTFF, fluidity, memory, and CPU usage.
 *
 * @module performance-monitor/performance-monitor
 * @see {@link https://developer.amazon.com/docs/vega/0.22/improve-performance-overview.html | Vega Performance Docs}
 */

import type {
  MetricCategory,
  PerformanceSample,
  PerformanceSummary,
  PerformanceThreshold,
  PerformanceWarning,
  PerformanceWarningListener,
} from './types';

/**
 * Centralized performance monitor for tracking app metrics and detecting
 * performance regressions.
 *
 * Records {@link PerformanceSample} entries, evaluates them against
 * configured {@link PerformanceThreshold} rules, and notifies registered
 * {@link PerformanceWarningListener} callbacks when thresholds are breached.
 *
 * @example
 * ```typescript
 * import { PerformanceMonitor, MetricCategory, WarningSeverity } from 'vega-sample-package';
 *
 * const monitor = new PerformanceMonitor();
 *
 * monitor.addThreshold({
 *   metricName: 'fps',
 *   category: MetricCategory.FLUIDITY,
 *   warnAboveOrBelow: 'below',
 *   value: 55,
 *   severity: WarningSeverity.WARNING,
 * });
 *
 * monitor.addWarningListener((warning) => {
 *   console.warn(`[${warning.severity}] ${warning.message}`);
 * });
 *
 * monitor.recordSample({
 *   timestamp: Date.now(),
 *   category: MetricCategory.FLUIDITY,
 *   name: 'fps',
 *   value: 48,
 *   unit: 'fps',
 * });
 * // Warning emitted: FPS dropped below threshold
 * ```
 */
export class PerformanceMonitor {
  /** Recorded performance samples. */
  private samples: PerformanceSample[] = [];

  /** Configured threshold rules. */
  private thresholds: PerformanceThreshold[] = [];

  /** Registered warning listeners. */
  private warningListeners: PerformanceWarningListener[] = [];

  /** History of emitted warnings. */
  private warnings: PerformanceWarning[] = [];

  /**
   * Records a performance sample and evaluates it against all thresholds.
   *
   * If the sample breaches any configured threshold, a
   * {@link PerformanceWarning} is generated and all registered listeners
   * are notified.
   *
   * @param sample - The performance sample to record.
   *
   * @example
   * ```typescript
   * monitor.recordSample({
   *   timestamp: Date.now(),
   *   category: MetricCategory.MEMORY,
   *   name: 'jsHeapUsedMB',
   *   value: 256,
   *   unit: 'MB',
   * });
   * ```
   */
  recordSample(sample: PerformanceSample): void {
    this.samples.push(sample);
    this.evaluateThresholds(sample);
  }

  /**
   * Adds a threshold rule for generating performance warnings.
   *
   * @param threshold - The threshold configuration to add.
   *
   * @see {@link PerformanceThreshold}
   *
   * @example
   * ```typescript
   * monitor.addThreshold({
   *   metricName: 'jsHeapUsedMB',
   *   category: MetricCategory.MEMORY,
   *   warnAboveOrBelow: 'above',
   *   value: 200,
   *   severity: WarningSeverity.CRITICAL,
   * });
   * ```
   */
  addThreshold(threshold: PerformanceThreshold): void {
    this.thresholds.push(threshold);
  }

  /**
   * Removes all threshold rules matching the given metric name and category.
   *
   * @param metricName - The metric name to match.
   * @param category - The metric category to match.
   */
  removeThreshold(metricName: string, category: MetricCategory): void {
    this.thresholds = this.thresholds.filter(
      (t) => !(t.metricName === metricName && t.category === category),
    );
  }

  /**
   * Registers a listener to receive performance warnings in real time.
   *
   * @param listener - The callback to invoke when a warning is generated.
   *
   * @example
   * ```typescript
   * monitor.addWarningListener((warning) => {
   *   analytics.track('perf_warning', { message: warning.message });
   * });
   * ```
   */
  addWarningListener(listener: PerformanceWarningListener): void {
    this.warningListeners.push(listener);
  }

  /**
   * Removes a previously registered warning listener.
   *
   * @param listener - The listener to remove.
   */
  removeWarningListener(listener: PerformanceWarningListener): void {
    const index = this.warningListeners.indexOf(listener);
    if (index !== -1) {
      this.warningListeners.splice(index, 1);
    }
  }

  /**
   * Returns all recorded samples, optionally filtered by category.
   *
   * @param category - If provided, only samples of this category are returned.
   * @returns An array of {@link PerformanceSample} objects.
   */
  getSamples(category?: MetricCategory): PerformanceSample[] {
    if (category === undefined) {
      return [...this.samples];
    }
    return this.samples.filter((s) => s.category === category);
  }

  /**
   * Returns all emitted warnings.
   *
   * @returns An array of {@link PerformanceWarning} objects.
   */
  getWarnings(): PerformanceWarning[] {
    return [...this.warnings];
  }

  /**
   * Computes summary statistics for a specific metric.
   *
   * Returns `undefined` if no samples exist for the given metric name
   * and category combination.
   *
   * @param metricName - The metric name to summarize.
   * @param category - The metric category to filter by.
   * @returns A {@link PerformanceSummary} or `undefined`.
   *
   * @example
   * ```typescript
   * const summary = monitor.getSummary('fps', MetricCategory.FLUIDITY);
   * if (summary) {
   *   console.log(`FPS — mean: ${summary.mean}, p95: ${summary.p95}`);
   * }
   * ```
   */
  getSummary(metricName: string, category: MetricCategory): PerformanceSummary | undefined {
    const filtered = this.samples.filter(
      (s) => s.name === metricName && s.category === category,
    );

    if (filtered.length === 0) {
      return undefined;
    }

    const values = filtered.map((s) => s.value);
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;

    return {
      category,
      metricName,
      sampleCount: filtered.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / filtered.length,
      p95: sorted[Math.max(0, p95Index)],
    };
  }

  /**
   * Clears all recorded samples and warnings.
   *
   * Thresholds and listeners are preserved.
   */
  reset(): void {
    this.samples = [];
    this.warnings = [];
  }

  /**
   * Evaluates a sample against all configured thresholds and emits
   * warnings for any breaches.
   */
  private evaluateThresholds(sample: PerformanceSample): void {
    for (const threshold of this.thresholds) {
      if (
        threshold.metricName !== sample.name ||
        threshold.category !== sample.category
      ) {
        continue;
      }

      const breached =
        threshold.warnAboveOrBelow === 'above'
          ? sample.value > threshold.value
          : sample.value < threshold.value;

      if (breached) {
        const direction = threshold.warnAboveOrBelow === 'above' ? 'exceeded' : 'dropped below';
        const warning: PerformanceWarning = {
          timestamp: sample.timestamp,
          severity: threshold.severity,
          category: sample.category,
          message: `${sample.name} ${direction} threshold of ${threshold.value}${sample.unit} (actual: ${sample.value}${sample.unit})`,
          sample,
        };
        this.warnings.push(warning);
        for (const listener of this.warningListeners) {
          listener(warning);
        }
      }
    }
  }
}
