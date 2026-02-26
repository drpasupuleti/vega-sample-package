/**
 * Type definitions for the Vega Overdraw Detector API.
 *
 * The Overdraw Detector helps identify redundant draw operations in a
 * view hierarchy. Overdraw occurs when the system paints pixels that are
 * later fully covered by other views, wasting GPU and CPU cycles.
 *
 * The tint-based severity model mirrors the Vega Studio overdraw
 * visualization: true color (no overdraw), blue (1×), green (2×),
 * pink (3×), red (4+×).
 *
 * @see {@link https://developer.amazon.com/docs/vega/0.22/avoid-overdraw.html | Avoid Overdraw}
 * @see {@link https://developer.amazon.com/docs/vega/0.22/detect-overdraw.html | Detect Overdraw}
 * @module overdraw-detector/types
 */

/**
 * Overdraw severity levels matching the Vega Studio tint colors.
 *
 * @example
 * ```typescript
 * if (node.overdrawLevel === OverdrawLevel.RED) {
 *   console.warn('4+ layers of overdraw detected');
 * }
 * ```
 */
export enum OverdrawLevel {
  /** No overdraw — pixel is drawn exactly once. */
  NONE = 'none',
  /** 1× overdraw (blue tint in Vega Studio). */
  BLUE = 'blue',
  /** 2× overdraw (green tint). */
  GREEN = 'green',
  /** 3× overdraw (pink tint). */
  PINK = 'pink',
  /** 4+ overdraw (red tint) — should be eliminated. */
  RED = 'red',
}

/**
 * Represents a single node in the view hierarchy for overdraw analysis.
 *
 * Each node has a bounding rectangle, an optional background color,
 * and zero or more children. The detector walks this tree to compute
 * overdraw layers at each pixel region.
 *
 * @see {@link OverdrawResult}
 *
 * @example
 * ```typescript
 * const root: ViewNode = {
 *   id: 'root',
 *   name: 'AppContainer',
 *   bounds: { x: 0, y: 0, width: 1920, height: 1080 },
 *   hasBackground: true,
 *   children: [
 *     {
 *       id: 'header',
 *       name: 'Header',
 *       bounds: { x: 0, y: 0, width: 1920, height: 80 },
 *       hasBackground: true,
 *       children: [],
 *     },
 *   ],
 * };
 * ```
 */
export interface ViewNode {
  /** Unique identifier for this view node. */
  id: string;
  /** Human-readable name or component type. */
  name: string;
  /** Bounding rectangle of this view in screen coordinates. */
  bounds: ViewBounds;
  /** Whether this node draws a background (contributes to overdraw). */
  hasBackground: boolean;
  /** Child nodes rendered on top of this node. */
  children: ViewNode[];
}

/**
 * Bounding rectangle for a view node in screen coordinates.
 */
export interface ViewBounds {
  /** X coordinate of the top-left corner. */
  x: number;
  /** Y coordinate of the top-left corner. */
  y: number;
  /** Width of the view. */
  width: number;
  /** Height of the view. */
  height: number;
}

/**
 * Result of overdraw analysis for a single view node.
 *
 * @see {@link OverdrawLevel}
 * @see {@link OverdrawReport}
 */
export interface OverdrawResult {
  /** The view node ID. */
  nodeId: string;
  /** The view node name. */
  nodeName: string;
  /** Number of background layers covering this node's region. */
  layerCount: number;
  /** The overdraw severity level. */
  overdrawLevel: OverdrawLevel;
}

/**
 * Complete overdraw analysis report for a view hierarchy.
 *
 * @see {@link OverdrawResult}
 *
 * @example
 * ```typescript
 * const report = detector.analyze(rootNode);
 * console.log(`Total nodes: ${report.totalNodes}`);
 * console.log(`Nodes with overdraw: ${report.nodesWithOverdraw}`);
 * for (const issue of report.results.filter(r => r.overdrawLevel === OverdrawLevel.RED)) {
 *   console.warn(`Critical overdraw at "${issue.nodeName}": ${issue.layerCount} layers`);
 * }
 * ```
 */
export interface OverdrawReport {
  /** Total number of nodes analyzed. */
  totalNodes: number;
  /** Number of nodes with any overdraw (layerCount > 1). */
  nodesWithOverdraw: number;
  /** Maximum layer count found across all nodes. */
  maxLayerCount: number;
  /** Per-node overdraw results. */
  results: OverdrawResult[];
}
