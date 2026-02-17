# vega-sample-package

A React Native + TypeScript reference package demonstrating two Vega OS APIs for Fire TV:

- **Content Launcher API** — Integrate with the Fire TV home launcher and Alexa voice commands for content search and playback
- **Media Controls API** — Handle diverse input modalities (remote, voice, touch) for media playback control
- **Performance Monitor API** — Track app performance metrics (FPS, memory, startup timing) with threshold-based warnings
- **Overdraw Detector API** — Analyze view hierarchies for redundant draw operations using the Vega Studio tint-color model

This package is designed as input for documentation generation tooling. It compiles and passes type/lint checks but is not intended to run on a real Vega device.

## Project Structure

```
src/
├── index.ts                              # Entry point, VERSION export, re-exports
├── content-launcher/
│   ├── types.ts                          # IContentSearch, ContentLaunchPayload, enums
│   ├── content-launcher.ts               # handleLaunchContent, payload serialization
│   ├── index.ts                          # Barrel export
│   └── examples/
│       └── launch-content-example.ts     # Content launch scenarios
├── media-controls/
│   ├── types.ts                          # IMediaControlClientAsync, IMediaControlHandlerAsync, MediaSession
│   ├── session-manager.ts                # Session lifecycle, listener management
│   ├── discovery.ts                      # Endpoint discovery registry
│   ├── index.ts                          # Barrel export
│   └── examples/
│       ├── media-handler-example.ts      # Handler implementation demo
│       └── pip-example.ts                # Picture-in-picture multi-session demo
├── performance-monitor/
│   ├── types.ts                          # PerformanceSample, thresholds, warnings, summaries
│   ├── performance-monitor.ts            # Sample recording, threshold evaluation, summaries
│   ├── index.ts                          # Barrel export
│   └── examples/
│       └── monitor-example.ts            # KPI tracking and threshold warning demo
└── overdraw-detector/
    ├── types.ts                          # ViewNode, OverdrawLevel, OverdrawReport
    ├── overdraw-detector.ts              # View hierarchy analysis, layer counting
    ├── index.ts                          # Barrel export
    └── examples/
        └── overdraw-example.ts           # Fire TV layout overdraw analysis demo
```

## Getting Started

```bash
npm install
```

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Content Launcher API

The Content Launcher module demonstrates how apps integrate with Fire TV's content discovery system.

### Key Types

| Type | Description |
|------|-------------|
| `IContentSearch` | Parameters for a content search request from the launcher or Alexa |
| `ContentLaunchPayload` | Processed payload with resolved intent and identifiers |
| `EntityType` | Enum for content types: VIDEO, SEASON, EPISODE, GENRE, ACTOR |
| `LaunchIntent` | `"play"` \| `"search"` \| `"playshow"` |

### Intent Determination

| autoPlay | amzn_id present | Entity type | Result |
|----------|----------------|-------------|--------|
| false | any | any | `"search"` |
| true | yes | EPISODE | `"playshow"` |
| true | yes | other | `"play"` |
| true | no | any | `"search"` |

### Usage

```typescript
import {
  handleLaunchContent,
  EntityType,
  type IContentSearch,
} from 'vega-sample-package';

const contentSearch: IContentSearch = {
  entities: [{
    type: EntityType.VIDEO,
    externalIdList: [{ name: 'amzn_id', value: 'tt0903747' }],
  }],
  searchKeyword: 'Breaking Bad',
};

const payload = handleLaunchContent(contentSearch, true, {});
// payload.launchIntent === 'play'
// payload.amzn_id === 'tt0903747'
```

## Media Controls API

The Media Controls module demonstrates session-based media playback control supporting multiple input modalities.

### Key Types

| Type | Description |
|------|-------------|
| `IMediaControlHandlerAsync` | Interface apps implement to handle control commands |
| `IMediaControlClientAsync` | Client interface for sending control commands |
| `MediaSession` | Session metadata: title, state, controls, capabilities |
| `SessionManager` | Manages session lifecycle, state updates, and listeners |
| `EndpointDiscovery` | Registry of media provider apps and their sessions |

### Usage

```typescript
import {
  SessionManager,
  PlaybackState,
  EndpointDiscovery,
} from 'vega-sample-package';

const manager = new SessionManager();

const session = manager.createSession({
  title: 'Planet Earth II',
  playbackState: PlaybackState.PLAYING,
  supportedControls: ['play', 'pause', 'stop', 'seek'],
  capabilities: {
    canSeek: true,
    canSkipForward: false,
    canSkipBackward: false,
    canFastForward: false,
    canRewind: false,
    canSetPlaybackSpeed: false,
  },
  positionMs: 0,
  durationMs: 3600000,
});

manager.addListener(session.sessionId, (updated) => {
  console.log(`State: ${updated.playbackState}`);
});

manager.updateSession(session.sessionId, {
  playbackState: PlaybackState.PAUSED,
});
```

## Performance Monitor API

The Performance Monitor module provides utilities for tracking app performance metrics and detecting regressions, inspired by the [Vega App KPI Visualizer](https://developer.amazon.com/docs/vega/0.22/measure-app-kpis.html) and [App Performance Best Practices](https://developer.amazon.com/docs/vega/0.22/best_practices.html).

### Key Types

| Type | Description |
|------|-------------|
| `PerformanceMonitor` | Central class for recording samples, evaluating thresholds, and emitting warnings |
| `PerformanceSample` | A single metric measurement at a point in time |
| `PerformanceThreshold` | Rule that triggers a warning when a metric crosses a boundary |
| `PerformanceWarning` | Warning emitted when a threshold is breached |
| `PerformanceSummary` | Aggregated statistics (min, max, mean, p95) for a metric |
| `MetricCategory` | Enum: FLUIDITY, MEMORY, RENDER, NETWORK, STARTUP |
| `WarningSeverity` | Enum: INFO, WARNING, CRITICAL |

### Usage

```typescript
import {
  PerformanceMonitor,
  MetricCategory,
  WarningSeverity,
} from 'vega-sample-package';

const monitor = new PerformanceMonitor();

monitor.addThreshold({
  metricName: 'fps',
  category: MetricCategory.FLUIDITY,
  warnAboveOrBelow: 'below',
  value: 55,
  severity: WarningSeverity.WARNING,
});

monitor.addWarningListener((warning) => {
  console.warn(`[${warning.severity}] ${warning.message}`);
});

monitor.recordSample({
  timestamp: Date.now(),
  category: MetricCategory.FLUIDITY,
  name: 'fps',
  value: 48,
  unit: 'fps',
});

const summary = monitor.getSummary('fps', MetricCategory.FLUIDITY);
```

## Overdraw Detector API

The Overdraw Detector module analyzes view hierarchies for redundant draw operations, mirroring the [Vega Studio overdraw visualization](https://developer.amazon.com/docs/vega/0.22/detect-overdraw.html) (`?SHOW_OVERDRAWN=true`).

### Key Types

| Type | Description |
|------|-------------|
| `ViewNode` | A node in the view hierarchy with bounds, background flag, and children |
| `OverdrawReport` | Complete analysis report with per-node results and summary stats |
| `OverdrawResult` | Per-node overdraw result with layer count and severity level |
| `OverdrawLevel` | Enum matching Vega Studio tints: NONE, BLUE (1×), GREEN (2×), PINK (3×), RED (4+×) |

### Overdraw Levels

| Layers | Level | Vega Studio Tint |
|--------|-------|-----------------|
| 0–1 | NONE | True color |
| 2 | BLUE | Blue |
| 3 | GREEN | Green |
| 4 | PINK | Pink |
| 5+ | RED | Red |

### Usage

```typescript
import {
  analyzeOverdraw,
  OverdrawLevel,
  type ViewNode,
} from 'vega-sample-package';

const root: ViewNode = {
  id: 'root',
  name: 'AppContainer',
  bounds: { x: 0, y: 0, width: 1920, height: 1080 },
  hasBackground: true,
  children: [
    {
      id: 'header',
      name: 'Header',
      bounds: { x: 0, y: 0, width: 1920, height: 80 },
      hasBackground: true,
      children: [],
    },
  ],
};

const report = analyzeOverdraw(root);
console.log(`Nodes with overdraw: ${report.nodesWithOverdraw}`);

const critical = report.results.filter(
  (r) => r.overdrawLevel === OverdrawLevel.RED,
);
```

## Documentation Generation

All public APIs are annotated with TSDoc comments including `@param`, `@returns`, `@example`, and `@see` tags. This makes the package compatible with documentation generation tools that parse TypeScript source.

## Version

Current version: `0.2.0`

Exported as `VERSION` from the package entry point. See [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

MIT
