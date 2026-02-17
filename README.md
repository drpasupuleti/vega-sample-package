# vega-sample-package

A React Native + TypeScript reference package demonstrating two Vega OS APIs for Fire TV:

- **Content Launcher API** — Integrate with the Fire TV home launcher and Alexa voice commands for content search and playback
- **Media Controls API** — Handle diverse input modalities (remote, voice, touch) for media playback control

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
└── media-controls/
    ├── types.ts                          # IMediaControlClientAsync, IMediaControlHandlerAsync, MediaSession
    ├── session-manager.ts                # Session lifecycle, listener management
    ├── discovery.ts                      # Endpoint discovery registry
    ├── index.ts                          # Barrel export
    └── examples/
        ├── media-handler-example.ts      # Handler implementation demo
        └── pip-example.ts                # Picture-in-picture multi-session demo
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

## Documentation Generation

All public APIs are annotated with TSDoc comments including `@param`, `@returns`, `@example`, and `@see` tags. This makes the package compatible with documentation generation tools that parse TypeScript source.

## Version

Current version: `0.1.0`

Exported as `VERSION` from the package entry point. See [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

MIT
