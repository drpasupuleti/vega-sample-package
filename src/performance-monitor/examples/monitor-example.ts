/**
 * Example demonstrating the Performance Monitor API.
 *
 * Shows how to configure thresholds, record samples, receive warnings,
 * and compute summary statistics — mirroring the workflow described in
 * the Vega App KPI Visualizer and performance best practices docs.
 *
 * @module performance-monitor/examples/monitor-example
 */

import {
  PerformanceMonitor,
  MetricCategory,
  WarningSeverity,
  type PerformanceSample,
} from '../';

// ---------------------------------------------------------------------------
// Step 1 — Create a monitor and configure thresholds
// ---------------------------------------------------------------------------

const monitor = new PerformanceMonitor();

// Warn if FPS drops below 55 (fluidity target is 99%+ at 60fps)
monitor.addThreshold({
  metricName: 'fps',
  category: MetricCategory.FLUIDITY,
  warnAboveOrBelow: 'below',
  value: 55,
  severity: WarningSeverity.WARNING,
});

// Critical if JS heap exceeds 200 MB
monitor.addThreshold({
  metricName: 'jsHeapUsedMB',
  category: MetricCategory.MEMORY,
  warnAboveOrBelow: 'above',
  value: 200,
  severity: WarningSeverity.CRITICAL,
});

// Warn if Time to First Frame exceeds 2 seconds
monitor.addThreshold({
  metricName: 'ttff',
  category: MetricCategory.STARTUP,
  warnAboveOrBelow: 'above',
  value: 2000,
  severity: WarningSeverity.WARNING,
});

console.log('Thresholds configured');
console.log();

// ---------------------------------------------------------------------------
// Step 2 — Register a warning listener
// ---------------------------------------------------------------------------

monitor.addWarningListener((warning) => {
  const icon = warning.severity === WarningSeverity.CRITICAL ? '🔴' : '🟡';
  console.log(`${icon} [${warning.severity.toUpperCase()}] ${warning.message}`);
});

// ---------------------------------------------------------------------------
// Step 3 — Simulate recording FPS samples over time
// ---------------------------------------------------------------------------

const fpsSamples: number[] = [60, 59, 58, 60, 55, 52, 48, 60, 59, 57, 54, 60];
const baseTime = Date.now();

console.log('Recording FPS samples...');
for (let i = 0; i < fpsSamples.length; i++) {
  const sample: PerformanceSample = {
    timestamp: baseTime + i * 1000,
    category: MetricCategory.FLUIDITY,
    name: 'fps',
    value: fpsSamples[i],
    unit: 'fps',
  };
  monitor.recordSample(sample);
}
console.log();

// ---------------------------------------------------------------------------
// Step 4 — Record memory samples
// ---------------------------------------------------------------------------

console.log('Recording memory samples...');
const memorySamples: number[] = [120, 145, 160, 180, 195, 210, 190, 175];
for (let i = 0; i < memorySamples.length; i++) {
  monitor.recordSample({
    timestamp: baseTime + i * 5000,
    category: MetricCategory.MEMORY,
    name: 'jsHeapUsedMB',
    value: memorySamples[i],
    unit: 'MB',
  });
}
console.log();

// ---------------------------------------------------------------------------
// Step 5 — Record startup timing
// ---------------------------------------------------------------------------

console.log('Recording startup sample...');
monitor.recordSample({
  timestamp: baseTime,
  category: MetricCategory.STARTUP,
  name: 'ttff',
  value: 1850,
  unit: 'ms',
});
console.log('  TTFF: 1850ms (within threshold)');
console.log();

// ---------------------------------------------------------------------------
// Step 6 — Compute and display summaries
// ---------------------------------------------------------------------------

const fpsSummary = monitor.getSummary('fps', MetricCategory.FLUIDITY);
if (fpsSummary) {
  console.log('FPS Summary:');
  console.log(`  Samples: ${fpsSummary.sampleCount}`);
  console.log(`  Min: ${fpsSummary.min} fps`);
  console.log(`  Max: ${fpsSummary.max} fps`);
  console.log(`  Mean: ${fpsSummary.mean.toFixed(1)} fps`);
  console.log(`  P95: ${fpsSummary.p95} fps`);
}
console.log();

const memorySummary = monitor.getSummary('jsHeapUsedMB', MetricCategory.MEMORY);
if (memorySummary) {
  console.log('Memory Summary:');
  console.log(`  Samples: ${memorySummary.sampleCount}`);
  console.log(`  Min: ${memorySummary.min} MB`);
  console.log(`  Max: ${memorySummary.max} MB`);
  console.log(`  Mean: ${memorySummary.mean.toFixed(1)} MB`);
  console.log(`  P95: ${memorySummary.p95} MB`);
}
console.log();

// ---------------------------------------------------------------------------
// Step 7 — Review all warnings
// ---------------------------------------------------------------------------

const allWarnings = monitor.getWarnings();
console.log(`Total warnings emitted: ${allWarnings.length}`);
for (const w of allWarnings) {
  console.log(`  [${w.severity}] ${w.message}`);
}
