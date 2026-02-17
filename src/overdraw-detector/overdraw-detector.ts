/**
 * Overdraw detection logic for Vega app view hierarchies.
 *
 * Walks a tree of {@link ViewNode} elements and computes how many
 * background layers overlap each node's region. This mirrors the
 * overdraw visualization available in Vega Studio when launching
 * an app with `?SHOW_OVERDRAWN=true`.
 *
 * @module overdraw-detector/overdraw-detector
 * @see {@link https://developer.amazon.com/docs/vega/0.22/avoid-overdraw.html | Avoid Overdraw}
 */

import {
  OverdrawLevel,
  type OverdrawReport,
  type OverdrawResult,
  type ViewBounds,
  type ViewNode,
} from './types';

/**
 * Maps a numeric layer count to the corresponding {@link OverdrawLevel}.
 *
 * | Layers | Level |
 * |--------|-------|
 * | 0–1    | NONE  |
 * | 2      | BLUE  |
 * | 3      | GREEN |
 * | 4      | PINK  |
 * | 5+     | RED   |
 *
 * @param layerCount - The number of background layers at a given region.
 * @returns The corresponding overdraw level.
 *
 * @example
 * ```typescript
 * classifyOverdraw(1); // OverdrawLevel.NONE
 * classifyOverdraw(3); // OverdrawLevel.GREEN
 * classifyOverdraw(5); // OverdrawLevel.RED
 * ```
 */
export function classifyOverdraw(layerCount: number): OverdrawLevel {
  if (layerCount <= 1) return OverdrawLevel.NONE;
  if (layerCount === 2) return OverdrawLevel.BLUE;
  if (layerCount === 3) return OverdrawLevel.GREEN;
  if (layerCount === 4) return OverdrawLevel.PINK;
  return OverdrawLevel.RED;
}

/**
 * Tests whether two bounding rectangles overlap.
 *
 * @param a - First bounding rectangle.
 * @param b - Second bounding rectangle.
 * @returns `true` if the rectangles overlap, `false` otherwise.
 */
export function boundsOverlap(a: ViewBounds, b: ViewBounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Collects all nodes with backgrounds from a view tree via depth-first traversal.
 *
 * @param node - The root node to traverse.
 * @returns A flat array of all nodes where `hasBackground` is `true`.
 */
function collectBackgroundNodes(node: ViewNode): ViewNode[] {
  const result: ViewNode[] = [];
  if (node.hasBackground) {
    result.push(node);
  }
  for (const child of node.children) {
    result.push(...collectBackgroundNodes(child));
  }
  return result;
}

/**
 * Collects all nodes from a view tree via depth-first traversal.
 *
 * @param node - The root node to traverse.
 * @returns A flat array of all nodes.
 */
function collectAllNodes(node: ViewNode): ViewNode[] {
  const result: ViewNode[] = [node];
  for (const child of node.children) {
    result.push(...collectAllNodes(child));
  }
  return result;
}

/**
 * Analyzes a view hierarchy for overdraw and produces a detailed report.
 *
 * For each node in the tree, counts how many ancestor or sibling nodes
 * with backgrounds overlap its bounding region. The result is classified
 * using the Vega Studio tint color model.
 *
 * @param root - The root {@link ViewNode} of the view hierarchy.
 * @returns An {@link OverdrawReport} with per-node results and summary stats.
 *
 * @see {@link classifyOverdraw} for the layer-to-level mapping.
 * @see {@link OverdrawReport}
 *
 * @example
 * ```typescript
 * import { analyzeOverdraw, OverdrawLevel } from 'vega-sample-package';
 *
 * const report = analyzeOverdraw(rootNode);
 * const critical = report.results.filter(r => r.overdrawLevel === OverdrawLevel.RED);
 * console.log(`${critical.length} nodes with critical overdraw`);
 * ```
 */
export function analyzeOverdraw(root: ViewNode): OverdrawReport {
  const backgroundNodes = collectBackgroundNodes(root);
  const allNodes = collectAllNodes(root);

  const results: OverdrawResult[] = allNodes.map((node) => {
    // Count how many background nodes overlap this node's bounds
    const layerCount = backgroundNodes.filter((bgNode) =>
      boundsOverlap(node.bounds, bgNode.bounds),
    ).length;

    return {
      nodeId: node.id,
      nodeName: node.name,
      layerCount,
      overdrawLevel: classifyOverdraw(layerCount),
    };
  });

  const nodesWithOverdraw = results.filter((r) => r.layerCount > 1).length;
  const maxLayerCount = results.reduce((max, r) => Math.max(max, r.layerCount), 0);

  return {
    totalNodes: allNodes.length,
    nodesWithOverdraw,
    maxLayerCount,
    results,
  };
}
