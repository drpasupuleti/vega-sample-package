/**
 * Example demonstrating the Overdraw Detector API.
 *
 * Builds a sample view hierarchy resembling a typical Fire TV app layout
 * and analyzes it for overdraw, mirroring the `?SHOW_OVERDRAWN=true`
 * launch argument workflow from Vega Studio.
 *
 * @module overdraw-detector/examples/overdraw-example
 */

import {
  analyzeOverdraw,
  OverdrawLevel,
  type ViewNode,
} from '../';

// ---------------------------------------------------------------------------
// Step 1 — Build a sample view hierarchy
// A typical Fire TV app with a full-screen background, header, content
// area with cards, and a footer. Some regions have multiple overlapping
// backgrounds, creating overdraw.
// ---------------------------------------------------------------------------

const rootNode: ViewNode = {
  id: 'root',
  name: 'AppContainer',
  bounds: { x: 0, y: 0, width: 1920, height: 1080 },
  hasBackground: true, // full-screen background
  children: [
    {
      id: 'header',
      name: 'Header',
      bounds: { x: 0, y: 0, width: 1920, height: 80 },
      hasBackground: true, // header bar background
      children: [
        {
          id: 'logo',
          name: 'Logo',
          bounds: { x: 20, y: 10, width: 200, height: 60 },
          hasBackground: false,
          children: [],
        },
        {
          id: 'nav',
          name: 'NavBar',
          bounds: { x: 300, y: 10, width: 1000, height: 60 },
          hasBackground: true, // nav background overlaps header
          children: [],
        },
      ],
    },
    {
      id: 'content',
      name: 'ContentArea',
      bounds: { x: 0, y: 80, width: 1920, height: 900 },
      hasBackground: true, // content area background
      children: [
        {
          id: 'card-1',
          name: 'MediaCard',
          bounds: { x: 40, y: 120, width: 400, height: 300 },
          hasBackground: true,
          children: [
            {
              id: 'card-1-overlay',
              name: 'CardOverlay',
              bounds: { x: 40, y: 320, width: 400, height: 100 },
              hasBackground: true, // gradient overlay on card
              children: [],
            },
          ],
        },
        {
          id: 'card-2',
          name: 'MediaCard',
          bounds: { x: 480, y: 120, width: 400, height: 300 },
          hasBackground: true,
          children: [],
        },
      ],
    },
    {
      id: 'footer',
      name: 'Footer',
      bounds: { x: 0, y: 980, width: 1920, height: 100 },
      hasBackground: true,
      children: [],
    },
  ],
};

// ---------------------------------------------------------------------------
// Step 2 — Run overdraw analysis
// ---------------------------------------------------------------------------

const report = analyzeOverdraw(rootNode);

console.log('Overdraw Analysis Report');
console.log('========================');
console.log(`Total nodes analyzed: ${report.totalNodes}`);
console.log(`Nodes with overdraw: ${report.nodesWithOverdraw}`);
console.log(`Max layer count:     ${report.maxLayerCount}`);
console.log();

// ---------------------------------------------------------------------------
// Step 3 — Display per-node results with tint colors
// ---------------------------------------------------------------------------

const tintEmoji: Record<string, string> = {
  [OverdrawLevel.NONE]: '⬜',
  [OverdrawLevel.BLUE]: '🟦',
  [OverdrawLevel.GREEN]: '🟩',
  [OverdrawLevel.PINK]: '🟪',
  [OverdrawLevel.RED]: '🟥',
};

console.log('Per-node results:');
for (const result of report.results) {
  const emoji = tintEmoji[result.overdrawLevel] ?? '❓';
  console.log(
    `  ${emoji} ${result.nodeName} (${result.nodeId}): ` +
      `${result.layerCount} layers → ${result.overdrawLevel}`,
  );
}
console.log();

// ---------------------------------------------------------------------------
// Step 4 — Identify critical overdraw areas
// ---------------------------------------------------------------------------

const critical = report.results.filter(
  (r) => r.overdrawLevel === OverdrawLevel.PINK || r.overdrawLevel === OverdrawLevel.RED,
);

if (critical.length > 0) {
  console.log('⚠ Critical overdraw detected:');
  for (const c of critical) {
    console.log(`  → "${c.nodeName}" has ${c.layerCount} overlapping background layers`);
    console.log('    Consider removing unnecessary background colors from parent views');
  }
} else {
  console.log('✅ No critical overdraw detected');
}
